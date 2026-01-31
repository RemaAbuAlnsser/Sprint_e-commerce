import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('site-info')
export class SiteInfoController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSiteInfo() {
    try {
      const settings = await this.settingsService.getSettings();
      
      if (settings) {
        return {
          success: true,
          data: {
            site_name: settings.site_name,
            site_logo: settings.site_logo,
            site_description: settings.site_description,
            favicon_url: settings.site_logo ? `${process.env.BASE_URL || 'http://localhost:3000'}/favicon.ico` : null
          }
        };
      }
      
      return {
        success: false,
        message: 'لم يتم العثور على إعدادات الموقع'
      };
    } catch (error) {
      console.error('Site info error:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء جلب معلومات الموقع'
      };
    }
  }
}
