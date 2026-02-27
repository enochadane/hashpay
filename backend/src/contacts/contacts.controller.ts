import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    async getUserContacts(
        @CurrentUser('id') userId: string,
        @Query() paginationQuery: PaginationQueryDto,
    ) {
        return this.contactsService.getUserContacts(userId, paginationQuery);
    }

    @Get(':contactId/transactions')
    async getContactTransactions(
        @CurrentUser('id') userId: string,
        @Param('contactId') contactId: string,
        @Query() paginationQuery: PaginationQueryDto,
    ) {
        return this.contactsService.getContactTransactions(userId, contactId, paginationQuery);
    }

    @Get(':contactId/accounts')
    async getContactAccounts(
        @CurrentUser('id') userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactsService.getContactAccounts(userId, contactId);
    }
}
