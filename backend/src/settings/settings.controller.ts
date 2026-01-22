import { Controller, Get, Put, Body, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SettingsService } from './settings.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseInterceptors(CacheInterceptor)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Roles('admin')
  @Put()
  async updateSettings(@Body() data: { site_logo?: string; site_image?: string }) {
    return this.settingsService.updateSettings(data);
  }
}
