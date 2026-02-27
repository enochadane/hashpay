import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
    private readonly logger = new Logger(AccountsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new user account for a specific currency.
     */
    async createAccount(userId: string, dto: CreateAccountDto) {
        // 1. Check if currency exists
        const currency = await this.prisma.currencies.findUnique({
            where: { id: dto.currencyId },
        });

        if (!currency) {
            throw new NotFoundException('Currency not found');
        }

        // 2. Check if user already has an account in this currency
        const existingAccount = await this.prisma.accounts.findFirst({
            where: {
                user_id: userId,
                currency_id: dto.currencyId,
            },
        });

        if (existingAccount) {
            throw new ConflictException(`User already has a ${currency.code} account`);
        }

        // 3. Generate a reasonably unique 10-digit account number loosely based on timestamp + random
        const accountNumber = this.generateAccountNumber();

        // 4. Create the account
        return this.prisma.accounts.create({
            data: {
                user_id: userId,
                currency_id: dto.currencyId,
                account_number: accountNumber,
                provider_details: dto.providerDetails,
                balance: 0,
            },
            include: {
                currencies: true,
            },
        });
    }

    /**
     * Get all accounts for a specific user.
     */
    async getUserAccounts(userId: string) {
        return this.prisma.accounts.findMany({
            where: { user_id: userId },
            include: {
                currencies: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Get a specific account by ID, ensuring it belongs to the user.
     */
    async getAccountById(accountId: string, userId: string) {
        const account = await this.prisma.accounts.findUnique({
            where: { id: accountId },
            include: {
                currencies: true,
            },
        });

        if (!account || account.user_id !== userId) {
            throw new NotFoundException('Account not found');
        }

        return account;
    }

    /**
     * Enable or disable an account.
     */
    async toggleAccountStatus(accountId: string, userId: string, isActive: boolean) {
        const account = await this.getAccountById(accountId, userId); // Re-use existence check

        return this.prisma.accounts.update({
            where: { id: account.id },
            data: { is_active: isActive },
            include: {
                currencies: true,
            },
        });
    }

    /**
     * Helper to generate a 10-digit account number.
     * In a real banking system this would follow specific modulo/checksum rules (e.g. Luhn algorithm).
     */
    private generateAccountNumber(): string {
        const prefix = '10';
        const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `${prefix}${randomPart}`;
    }
}
