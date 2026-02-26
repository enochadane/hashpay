import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    /**
     * Creates a notification in the DB and pushes it down the WebSocket in real-time.
     */
    async sendNotification(dto: CreateNotificationDto) {
        // 1. Save to DB
        const notification = await this.prismaService.notifications.create({
            data: {
                user_id: dto.userId,
                title: dto.title,
                message: dto.message,
            },
        });

        // 2. Emit via WebSocket to specific user room
        this.notificationsGateway.sendToUser(dto.userId, 'new_notification', notification);

        return notification;
    }

    /**
     * Get unread notifications for a user.
     */
    async getUserNotifications(userId: string) {
        return this.prismaService.notifications.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50,
        });
    }

    /**
     * Mark a specific notification as read.
     */
    async markAsRead(notificationId: string, userId: string) {
        const existing = await this.prismaService.notifications.findUnique({
            where: { id: notificationId },
        });

        if (!existing || existing.user_id !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return this.prismaService.notifications.update({
            where: { id: notificationId },
            data: { is_read: true },
        });
    }

    /**
     * Mark all notifications as read for a user.
     */
    async markAllAsRead(userId: string) {
        return this.prismaService.notifications.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true },
        });
    }

    /**
     * Emits a generic WebSocket event to a user.
     */
    emitEvent(userId: string, event: string, payload: any) {
        this.notificationsGateway.sendToUser(userId, event, payload);
    }
}
