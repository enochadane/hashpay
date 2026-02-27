import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(SupabaseAuthGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    async getUserContacts(@CurrentUser('id') userId: string) {
        return this.contactsService.getUserContacts(userId);
    }

    @Get(':contactId/transactions')
    async getContactTransactions(
        @CurrentUser('id') userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactsService.getContactTransactions(userId, contactId);
    }

    @Get(':contactId/accounts')
    async getContactAccounts(
        @CurrentUser('id') userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactsService.getContactAccounts(userId, contactId);
    }
}
