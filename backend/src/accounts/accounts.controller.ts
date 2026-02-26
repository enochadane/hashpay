import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(SupabaseAuthGuard)
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Post()
    async createAccount(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateAccountDto,
    ) {
        return this.accountsService.createAccount(userId, dto);
    }

    @Get()
    async getUserAccounts(@CurrentUser('id') userId: string) {
        return this.accountsService.getUserAccounts(userId);
    }

    @Get(':id')
    async getAccountById(
        @Param('id') accountId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.accountsService.getAccountById(accountId, userId);
    }

    @Patch(':id/status')
    async toggleStatus(
        @Param('id') accountId: string,
        @CurrentUser('id') userId: string,
        @Body('isActive') isActive: boolean,
    ) {
        return this.accountsService.toggleAccountStatus(accountId, userId, isActive);
    }
}
