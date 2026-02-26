import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export interface SupabaseJwtPayload {
    sub: string;
    email?: string;
    role?: string;
    aud?: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
    private readonly logger = new Logger(SupabaseJwtStrategy.name);

    constructor(configService: ConfigService) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL must be set in environment variables.');
        }

        // Supabase exposes a JWKS endpoint at /.well-known/jwks.json
        // This is the correct way to verify ES256-signed JWTs
        const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKeyProvider: passportJwtSecret({
                jwksUri,
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
            }),
            issuer: `${supabaseUrl}/auth/v1`,
            algorithms: ['ES256'],
            ignoreExpiration: false,
        });

        new Logger(SupabaseJwtStrategy.name).log(`JWKS URI configured: ${jwksUri}`);
    }

    /**
     * Called after the JWT is verified. The returned value is attached to `request.user`.
     */
    validate(payload: SupabaseJwtPayload) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
