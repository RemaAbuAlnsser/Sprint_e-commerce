import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string; name: string }) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }
}
