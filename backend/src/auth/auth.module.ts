import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './supabase-jwt.strategy';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'supabase-jwt' })],
    providers: [AuthService, SupabaseJwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
