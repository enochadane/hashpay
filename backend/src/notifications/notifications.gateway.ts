import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { SupabaseJwtPayload } from '../auth/supabase-jwt.strategy';

@WebSocketGateway({
    namespace: 'notifications',
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(NotificationsGateway.name);
    private jwtSecret: string;

    constructor(private readonly configService: ConfigService) { }

    afterInit(server: Server) {
        this.logger.log('Notifications Gateway initialized');
        this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET') || '';
    }

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake auth or query
            const token = this.extractTokenFromHandshake(client);
            if (!token) {
                this.logger.warn(`Client disconnected - No token provided: ${client.id}`);
                client.disconnect();
                return;
            }

            // Verify the Supabase JWT
            const payload = jwt.verify(token, this.jwtSecret) as SupabaseJwtPayload;
            const userId = payload.sub;

            if (!userId) {
                throw new Error('Invalid token payload');
            }

            // Join a user-specific room
            const roomName = `user_${userId}`;
            client.join(roomName);

            this.logger.log(`Client connected: ${client.id} - Joined room: ${roomName}`);
        } catch (error) {
            this.logger.warn(`Client disconnected - Invalid token: ${client.id} - ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Send a socket event to a specific user's room
     */
    sendToUser(userId: string, event: string, payload: any) {
        this.server.to(`user_${userId}`).emit(event, payload);
    }

    private extractTokenFromHandshake(client: Socket): string | null {
        // 1. Try auth object (standard Socket.io v4+)
        if (client.handshake.auth && client.handshake.auth.token) {
            return client.handshake.auth.token;
        }

        // 2. Try auth headers
        if (client.handshake.headers.authorization) {
            const authHeader = client.handshake.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                return authHeader.split(' ')[1];
            }
        }

        // 3. Try query param
        if (client.handshake.query && client.handshake.query.token) {
            return client.handshake.query.token as string;
        }

        return null;
    }
}
