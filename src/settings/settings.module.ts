import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { FaviconController } from './favicon.controller';
import { SiteInfoController } from './site-info.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController, FaviconController, SiteInfoController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
