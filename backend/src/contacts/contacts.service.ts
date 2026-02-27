import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserContacts(userId: string) {
        const contacts = await this.prisma.contacts.findMany({
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
        });

        return contacts.map(c => {
            const profile = c.contact_profile;
            return {
                id: profile.id,
                name: `${profile.first_name} ${profile.last_name}`,
                email: profile.user?.email || '',
                currencies: profile.accounts.map(acc => ({
                    countryCode: acc.currencies.country_code,
                    code: acc.currencies.code,
                    accountCount: 1,
                })),
                createdOn: profile.created_at,
            };
        });
    }

    async getContactTransactions(userId: string, contactUserId: string) {
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

        return this.prisma.transactions.findMany({
            where: {
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
            },
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
        });
    }
}
