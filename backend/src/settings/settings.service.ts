import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
  constructor(private databaseService: DatabaseService) {}

  async getSettings() {
    const query = 'SELECT * FROM settings ORDER BY id DESC LIMIT 1';
    const result: any = await this.databaseService.query(query);
    
    if (result.length === 0) {
      // Create default settings if none exist
      const insertQuery = 'INSERT INTO settings (site_logo, site_image) VALUES (NULL, NULL)';
      await this.databaseService.query(insertQuery);
      return { site_logo: null, site_image: null };
    }
    
    return result[0];
  }

  async updateSettings(data: { site_logo?: string; site_image?: string }) {
    // Get current settings
    const current: any = await this.getSettings();
    
    // Update only provided fields
    const updateData = {
      site_logo: data.site_logo !== undefined ? data.site_logo : current.site_logo,
      site_image: data.site_image !== undefined ? data.site_image : current.site_image,
    };

    const query = `
      UPDATE settings 
      SET site_logo = ?, site_image = ?
      WHERE id = ?
    `;
    
    await this.databaseService.query(query, [
      updateData.site_logo,
      updateData.site_image,
      current.id,
    ]);

    return { success: true, message: 'تم تحديث الإعدادات بنجاح' };
  }
}
