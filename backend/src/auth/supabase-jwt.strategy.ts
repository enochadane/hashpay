import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface SupabaseJwtPayload {
    sub: string;       // user UUID
    email?: string;
    role?: string;
    aud?: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('SUPABASE_JWT_SECRET must be set in environment variables.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
            ignoreExpiration: false,
        });
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
