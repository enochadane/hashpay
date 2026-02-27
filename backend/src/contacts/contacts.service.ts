import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class ContactsService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserContacts(userId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<any>> {
        const { page = 1, limit = 5 } = paginationQuery;
        const skip = (page - 1) * limit;

        const userAccounts = await this.prisma.accounts.findMany({
            where: { user_id: userId },
            select: { id: true },
        });
        const userAccountIds = userAccounts.map(a => a.id);

        const allTransactions = await this.prisma.transactions.findMany({
            where: {
                OR: [
                    { from_account_id: { in: userAccountIds } },
                    { to_account_id: { in: userAccountIds } }
                ]
            },
            include: {
                from_account: { select: { user_id: true } },
                to_account: { select: { user_id: true } },
                currency: { select: { code: true } }
            }
        });

        const contactCurrencyMap = new Map<string, Set<string>>();
        for (const t of allTransactions) {
            const isFromUser = userAccountIds.includes(t.from_account_id);
            const otherUserId = isFromUser ? t.to_account.user_id : t.from_account.user_id;

            if (!contactCurrencyMap.has(otherUserId)) {
                contactCurrencyMap.set(otherUserId, new Set());
            }
            contactCurrencyMap.get(otherUserId)!.add(t.currency.code);
        }

        const [contacts, total] = await Promise.all([
            this.prisma.contacts.findMany({
                where: { user_id: userId },
                include: {
                    contact_profile: {
                        include: {
                            user: { select: { email: true } },
                            accounts: {
                                include: {
                                    currencies: true,
                                },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.contacts.count({
                where: { user_id: userId },
            }),
        ]);

        const data = contacts.map(c => {
            const profile = c.contact_profile;
            const validCurrencies = contactCurrencyMap.get(profile.id) || new Set();

            return {
                id: profile.id,
                name: `${profile.first_name} ${profile.last_name}`,
                email: profile.user?.email || '',
                currencies: profile.accounts
                    .filter(acc => validCurrencies.has(acc.currencies.code))
                    .map(acc => ({
                        countryCode: acc.currencies.country_code,
                        code: acc.currencies.code,
                        accountCount: 1,
                    })),
                createdOn: profile.created_at,
            };
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getContactTransactions(
        userId: string,
        contactUserId: string,
        paginationQuery: PaginationQueryDto,
    ): Promise<PaginatedResponseDto<any>> {
        const { page = 1, limit = 5 } = paginationQuery;
        const skip = (page - 1) * limit;

        const userAccounts = await this.prisma.accounts.findMany({
            where: { user_id: userId },
            select: { id: true },
        });
        const userAccountIds = userAccounts.map(a => a.id);

        const contactAccounts = await this.prisma.accounts.findMany({
            where: { user_id: contactUserId },
            select: { id: true },
        });
        const contactAccountIds = contactAccounts.map(a => a.id);

        const where = {
            OR: [
                {
                    from_account_id: { in: userAccountIds },
                    to_account_id: { in: contactAccountIds },
                },
                {
                    from_account_id: { in: contactAccountIds },
                    to_account_id: { in: userAccountIds },
                },
            ],
        };

        const [transactions, total] = await Promise.all([
            this.prisma.transactions.findMany({
                where,
                include: {
                    currency: true,
                    from_account: {
                        select: {
                            provider_details: true,
                            user_id: true,
                            profiles: { select: { first_name: true, last_name: true } },
                        }
                    },
                    to_account: {
                        select: {
                            provider_details: true,
                            user_id: true,
                            profiles: { select: { first_name: true, last_name: true } },
                        }
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transactions.count({ where }),
        ]);

        return {
            data: transactions,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getContactAccounts(userId: string, contactUserId: string) {
        return this.prisma.accounts.findMany({
            where: {
                user_id: contactUserId,
                is_active: true,
            },
            include: {
                currencies: true,
            },
        });
    }
}
