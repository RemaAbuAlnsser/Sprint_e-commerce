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

  @Public()
  @Put()
  async updateSettings(@Body() data: { 
    site_logo?: string; 
    site_image?: string;
    site_images?: string[];
    site_name?: string;
    site_description?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    facebook_url?: string;
    instagram_url?: string;
    whatsapp_url?: string;
  }) {
    return this.settingsService.updateSettings(data);
  }
}
