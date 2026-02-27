import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [AuthModule, PrismaModule],
    providers: [ReportsService],
    controllers: [ReportsController],
})
export class ReportsModule { }
