import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Post,
    Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @CurrentUser('id') userId: string,
        @Query() paginationQuery: PaginationQueryDto,
    ) {
        return this.notificationsService.getUserNotifications(userId, paginationQuery);
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }

    @Post('read-all')
    async markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }
}
