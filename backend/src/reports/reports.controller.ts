import { Controller, Get, Param, UseGuards, Res, Header } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Response } from 'express';

@Controller('reports')
@UseGuards(SupabaseAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('transactions/:id/pdf')
    @Header('Content-Type', 'application/pdf')
    async downloadTransactionPdf(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Res() res: Response,
    ) {
        const buffer = await this.reportsService.generateTransactionPdf(id, user.id);

        res.set({
            'Content-Disposition': `attachment; filename=receipt-${id.slice(0, 8)}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
