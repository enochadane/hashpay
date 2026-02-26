import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private client: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error(
                'Supabase URL or Service Role Key is missing. Check your .env file.',
            );
            throw new Error(
                'Supabase URL and Service Role Key must be provided in environment variables.',
            );
        }

        this.client = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized successfully');
    }

    /**
     * Returns the Supabase client instance for direct use.
     */
    getClient(): SupabaseClient {
        return this.client;
    }
}
