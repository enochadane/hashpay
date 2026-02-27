import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post('transfer')
    async createTransfer(
        @CurrentUser() user: any,
        @Body() dto: CreateTransferDto,
    ) {
        return this.transactionsService.createTransfer(user.id, dto);
    }

    @Get()
    async getUserTransactions(
        @CurrentUser() user: any,
        @Query() paginationQuery: PaginationQueryDto,
    ) {
        return this.transactionsService.getUserTransactions(user.id, paginationQuery);
    }

    @Get(':id')
    async getTransactionById(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.transactionsService.getTransactionById(id, user.id);
    }
}
