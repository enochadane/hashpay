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
import { JwksClient } from 'jwks-rsa';
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
    private jwks: JwksClient;
    private supabaseIssuer: string;

    constructor(private readonly configService: ConfigService) { }

    afterInit(server: Server) {
        this.logger.log('Notifications Gateway initialized');

        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        if (!supabaseUrl) {
            this.logger.error('⚠️  SUPABASE_URL is not set — socket auth will fail!');
            return;
        }

        this.supabaseIssuer = `${supabaseUrl}/auth/v1`;
        const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

        this.jwks = new JwksClient({
            jwksUri,
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 10,
        });

        this.logger.log(`Gateway using JWKS endpoint: ${jwksUri}`);
    }

    async handleConnection(client: Socket) {
        this.logger.log(`[handleConnection] New client: ${client.id}`);

        try {
            const token = this.extractTokenFromHandshake(client);
            if (!token) {
                this.logger.warn(`[handleConnection] ❌ No token — disconnecting ${client.id}`);
                client.disconnect();
                return;
            }

            // Decode the header to get the key ID (kid)
            const decoded = jwt.decode(token, { complete: true });
            if (!decoded || !decoded.header || !decoded.header.kid) {
                throw new Error('Token has no kid in header');
            }

            this.logger.log(`[handleConnection] Token kid: ${decoded.header.kid}, alg: ${decoded.header.alg}`);

            // Fetch the signing key from Supabase JWKS endpoint
            const key = await this.jwks.getSigningKey(decoded.header.kid);
            const publicKey = key.getPublicKey();

            // Verify the JWT using the public key
            const payload = jwt.verify(token, publicKey, {
                algorithms: ['ES256'],
                issuer: this.supabaseIssuer,
            }) as SupabaseJwtPayload;

            const userId = payload.sub;
            if (!userId) {
                throw new Error('Invalid token payload — no sub claim');
            }

            const roomName = `user_${userId}`;
            client.join(roomName);

            this.logger.log(`[handleConnection] ✅ Client ${client.id} authenticated as user ${userId} — joined room ${roomName}`);
        } catch (error) {
            this.logger.warn(`[handleConnection] ❌ Auth failed for ${client.id}: ${error.message}`);
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
        const room = `user_${userId}`;
        this.logger.log(`[sendToUser] Emitting '${event}' to room '${room}'`);
        this.server.to(room).emit(event, payload);
    }

    private extractTokenFromHandshake(client: Socket): string | null {
        if (client.handshake.auth && client.handshake.auth.token) {
            return client.handshake.auth.token;
        }
        if (client.handshake.headers.authorization) {
            const authHeader = client.handshake.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                return authHeader.split(' ')[1];
            }
        }
        if (client.handshake.query && client.handshake.query.token) {
            return client.handshake.query.token as string;
        }
        return null;
    }
}
