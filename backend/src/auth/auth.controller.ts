import { Controller, Post, Body, Get, Request, UseGuards, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.adminLogin(loginDto.email, loginDto.password);
  }

  @Post('register')
  @UseGuards(AdminAuthGuard)
  async register(@Body() registerDto: { email: string; password: string; name: string }) {
    return this.authService.registerAdmin(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Patch('user/:id/role')
  @UseGuards(AdminAuthGuard)
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: { role: string }
  ) {
    return this.authService.updateUserRole(parseInt(id), updateRoleDto.role);
  }

  @Post('setup-admin')
  async setupAdmin(@Body() setupDto: { email: string }) {
    return this.authService.makeUserAdmin(setupDto.email);
  }
}
