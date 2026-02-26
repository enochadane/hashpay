import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

const IDEMPOTENCY_PREFIX = 'txn:idempotency:';
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
        private readonly redisService: RedisService,
    ) { }

    /**
     * Executes a P2P transfer between two accounts atomically and idempotently.
     *
     * Idempotency flow:
     * 1. Check Redis cache (fast path) → return cached transaction if found
     * 2. Check Postgres unique constraint (safety net) → return existing transaction if found
     * 3. Execute transfer in a DB transaction
     * 4. Cache the result in Redis with a 24h TTL
     */
    async createTransfer(userId: string, dto: CreateTransferDto) {
        const redisKey = `${IDEMPOTENCY_PREFIX}${dto.idempotencyKey}`;

        // 1. Fast path: Check Redis cache first
        const cachedTxn = await this.redisService.get(redisKey);
        if (cachedTxn) {
            this.logger.log(`Idempotent hit (Redis): Transaction cached for key ${dto.idempotencyKey}`);
            return JSON.parse(cachedTxn);
        }

        // 2. Safety net: Check Postgres (handles edge case where Redis was evicted but txn exists)
        const existingTxn = await this.prisma.transactions.findUnique({
            where: { idempotency_key: dto.idempotencyKey },
            include: { currencies: true },
        });

        if (existingTxn) {
            this.logger.log(`Idempotent hit (DB): Transaction exists for key ${dto.idempotencyKey}`);
            // Re-populate Redis cache so future checks are fast
            await this.redisService.set(redisKey, JSON.stringify(existingTxn), IDEMPOTENCY_TTL_SECONDS);
            return existingTxn;
        }

        // 3. Execute Atomic Transaction
        const transaction = await this.prisma.$transaction(async (tx) => {
            // a. Verify and lock the sender account row
            const senderAccounts: any[] = await tx.$queryRaw`
                SELECT * FROM public.accounts 
                WHERE id = ${dto.fromAccountId}::uuid 
                FOR UPDATE
            `;

            const sender = senderAccounts[0];

            if (!sender) {
                throw new NotFoundException('Sender account not found');
            }

            if (sender.user_id !== userId) {
                throw new BadRequestException('You do not own the source account');
            }

            if (!sender.is_active) {
                throw new BadRequestException('Source account is inactive');
            }

            // b. Verify receiver account exists and is active
            const receiver = await tx.accounts.findUnique({
                where: { id: dto.toAccountId },
            });

            if (!receiver) {
                throw new NotFoundException('Receiver account not found');
            }

            if (!receiver.is_active) {
                throw new BadRequestException('Receiver account is inactive');
            }

            // c. Cross-validation: Currencies must match
            if (sender.currency_id !== dto.currencyId || receiver.currency_id !== dto.currencyId) {
                throw new BadRequestException('Currency mismatch between accounts and request');
            }

            if (sender.id === receiver.id) {
                throw new BadRequestException('Cannot transfer to the same account');
            }

            // d. Check balance
            const transferAmount = new Prisma.Decimal(dto.amount);
            const currentBalance = new Prisma.Decimal(sender.balance.toString());

            if (currentBalance.lessThan(transferAmount)) {
                throw new BadRequestException('Insufficient funds');
            }

            // e. Perform balance updates
            await tx.accounts.update({
                where: { id: sender.id },
                data: { balance: { decrement: transferAmount } },
            });

            await tx.accounts.update({
                where: { id: receiver.id },
                data: { balance: { increment: transferAmount } },
            });

            // f. Record the transaction
            return await tx.transactions.create({
                data: {
                    from_account_id: sender.id,
                    to_account_id: receiver.id,
                    amount: transferAmount,
                    currency_id: dto.currencyId,
                    status: 'APPROVED',
                    idempotency_key: dto.idempotencyKey,
                    processed_at: new Date(),
                },
                include: {
                    currencies: true,
                    accounts_transactions_from_account_idToaccounts: true,
                    accounts_transactions_to_account_idToaccounts: true,
                }
            });
        });

        // 4. Post-Commit: Cache in Redis & send notifications
        try {
            // Cache the completed transaction in Redis (24h TTL)
            await this.redisService.set(redisKey, JSON.stringify(transaction), IDEMPOTENCY_TTL_SECONDS);
            this.logger.log(`Cached transaction ${transaction.id} in Redis (TTL: ${IDEMPOTENCY_TTL_SECONDS}s)`);

            const senderAccount = transaction.accounts_transactions_from_account_idToaccounts;
            const receiverAccount = transaction.accounts_transactions_to_account_idToaccounts;

            const fromUserId = senderAccount.user_id;
            const toUserId = receiverAccount.user_id;
            const receiverAccNum = receiverAccount.account_number;

            // Emit TRANSACTION_SUCCESS via WebSockets to both parties
            this.notificationsService.emitEvent(fromUserId, 'TRANSACTION_SUCCESS', transaction);
            this.notificationsService.emitEvent(toUserId, 'TRANSACTION_SUCCESS', transaction);

            // Send persistent notifications
            await Promise.all([
                this.notificationsService.sendNotification({
                    userId: fromUserId,
                    title: 'Sent Transfer',
                    message: `You sent ${dto.amount} ${transaction.currencies.code} to account ${receiverAccNum}.`,
                }),
                this.notificationsService.sendNotification({
                    userId: toUserId,
                    title: 'Received Transfer',
                    message: `You received ${dto.amount} ${transaction.currencies.code} from a user.`,
                }),
            ]);
        } catch (err) {
            this.logger.error(`Post-commit actions failed for transaction ${transaction.id}: ${err.message}`);
        }

        return transaction;
    }

    /**
     * Get transaction history for a user.
     */
    async getUserTransactions(userId: string) {
        const accounts = await this.prisma.accounts.findMany({
            where: { user_id: userId },
            select: { id: true },
        });

        const accountIds = accounts.map(a => a.id);

        return this.prisma.transactions.findMany({
            where: {
                OR: [
                    { from_account_id: { in: accountIds } },
                    { to_account_id: { in: accountIds } },
                ],
            },
            include: {
                currencies: true,
                accounts_transactions_from_account_idToaccounts: {
                    include: { profiles: true }
                },
                accounts_transactions_to_account_idToaccounts: {
                    include: { profiles: true }
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Get a single transaction by ID.
     */
    async getTransactionById(txnId: string, userId: string) {
        const txn = await this.prisma.transactions.findUnique({
            where: { id: txnId },
            include: { currencies: true },
        });

        if (!txn) {
            throw new NotFoundException('Transaction not found');
        }

        const accounts = await this.prisma.accounts.findMany({
            where: { user_id: userId },
            select: { id: true },
        });

        const accountIds = accounts.map(a => a.id);

        if (!accountIds.includes(txn.from_account_id) && !accountIds.includes(txn.to_account_id)) {
            throw new BadRequestException('Access denied to this transaction');
        }

        return txn;
    }
}
