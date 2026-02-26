import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { SignUpDto, LoginDto, RefreshDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.signIn(dto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(SupabaseAuthGuard)
    async logout(@CurrentUser('id') userId: string) {
        return this.authService.signOut(userId);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refreshSession(dto.refreshToken);
    }

    @Get('me')
    @UseGuards(SupabaseAuthGuard)
    async me(@CurrentUser('id') userId: string) {
        return this.authService.getProfile(userId);
    }
}
