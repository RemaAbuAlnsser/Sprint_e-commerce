import { Controller, Get, Put, Body, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseInterceptors(CacheInterceptor)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

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
