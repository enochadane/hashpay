import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class AccountsService {
    private readonly logger = new Logger(AccountsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new user account for a specific currency.
     */
    async createAccount(userId: string, dto: CreateAccountDto) {
        const currency = await this.prisma.currencies.findUnique({
            where: { id: dto.currencyId },
        });

        if (!currency) {
            throw new NotFoundException('Currency not found');
        }

        const existingAccount = await this.prisma.accounts.findFirst({
            where: {
                user_id: userId,
                currency_id: dto.currencyId,
            },
        });

        if (existingAccount) {
            throw new ConflictException(`User already has a ${currency.code} account`);
        }

        const accountNumber = this.generateAccountNumber();

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
    async getUserAccounts(userId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
        const { page = 1, limit = 5 } = paginationQuery;
        const skip = (page - 1) * limit;

        const [accounts, total] = await Promise.all([
            this.prisma.accounts.findMany({
                where: { user_id: userId },
                include: {
                    currencies: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.accounts.count({
                where: { user_id: userId },
            }),
        ]);

        return {
            data: accounts,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
