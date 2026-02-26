import { Injectable, Logger, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prismaService: PrismaService,
    ) { }

    /**
     * Register a new user via Supabase Auth.
     * The DB trigger automatically creates the profile row.
     */
    async signUp(dto: SignUpDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                },
            },
        });

        if (error) {
            this.logger.error(`Signup failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return {
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
            } : null,
            session: data.session ? {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                expiresAt: data.session.expires_at,
            } : null,
        };
    }

    /**
     * Sign in with email & password.
     */
    async signIn(dto: LoginDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) {
            this.logger.warn(`Login failed for ${dto.email}: ${error.message}`);
            throw new UnauthorizedException('Invalid email or password');
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                expiresAt: data.session.expires_at,
            },
        };
    }

    /**
     * Sign out the current user by invalidating their session.
     */
    async signOut(userId: string) {
        const supabase = this.supabaseService.getClient();

        // Use admin API to sign out the user on the server side
        const { error } = await supabase.auth.admin.signOut(userId);

        if (error) {
            this.logger.error(`Logout failed for user ${userId}: ${error.message}`);
            throw new InternalServerErrorException('Failed to sign out');
        }

        return { message: 'Successfully signed out' };
    }

    /**
     * Refresh an expired access token using a refresh token.
     */
    async refreshSession(refreshToken: string) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            this.logger.warn(`Token refresh failed: ${error.message}`);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (!data.session) {
            throw new UnauthorizedException('Could not refresh session');
        }

        return {
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                expiresAt: data.session.expires_at,
            },
        };
    }

    /**
     * Get the user's profile from the database.
     */
    async getProfile(userId: string) {
        const profile = await this.prismaService.profiles.findUnique({
            where: { id: userId },
            include: {
                accounts: {
                    include: {
                        currencies: true,
                    },
                },
            },
        });

        if (!profile) {
            throw new BadRequestException('Profile not found');
        }

        return profile;
    }
}
