import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: RedisClientType;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const url = this.configService.get<string>('REDIS_URL');
        this.client = createClient({ url }) as RedisClientType;

        this.client.on('error', (err) => {
            this.logger.error(`Redis client error: ${err.message}`);
        });

        await this.client.connect();
        this.logger.log('Redis client connected');
    }

    async onModuleDestroy() {
        await this.client?.disconnect();
        this.logger.log('Redis client disconnected');
    }

    /**
     * Get a value by key. Returns null if not found or expired.
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * Set a key-value pair with an optional TTL in seconds.
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.setEx(key, ttlSeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    /**
     * Delete a key.
     */
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Check if a key exists.
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }
}
