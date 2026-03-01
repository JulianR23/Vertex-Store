import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './models/dto/register.dto';
import { LoginDto } from './models/dto/login.dto';
import { AuthResponse } from './models/types/auth-response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const result = await this.authService.register(dto);
    if (!result.isSuccess) {
      throw new ConflictException(result.error);
    }
    return result.value;
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    const result = await this.authService.login(dto);
    if (!result.isSuccess) {
      throw new UnauthorizedException(result.error);
    }
    return result.value;
  }
}