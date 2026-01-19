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
      return { site_logo: null, site_image: null, site_images: [] };
    }
    
    // Get site images
    const imagesQuery = 'SELECT * FROM site_images ORDER BY display_order ASC, id ASC';
    const siteImages: any = await this.databaseService.query(imagesQuery);
    
    return {
      ...result[0],
      site_images: siteImages,
    };
  }

  async updateSettings(data: { site_logo?: string; site_image?: string; site_images?: string[]; current_site_images?: any[] }) {
    // Get current settings
    const current: any = await this.getSettings();
    
    // Update logo if provided
    if (data.site_logo !== undefined) {
      const query = 'UPDATE settings SET site_logo = ? WHERE id = ?';
      await this.databaseService.query(query, [data.site_logo, current.id]);
    }

    // Handle site images - Replace all existing images with new ones
    if (data.site_images && data.site_images.length > 0) {
      // First, delete all existing site images
      await this.databaseService.query('DELETE FROM site_images');
      
      // Then insert new site images
      for (let i = 0; i < data.site_images.length; i++) {
        const insertQuery = `
          INSERT INTO site_images (image_url, display_order)
          VALUES (?, ?)
        `;
        await this.databaseService.query(insertQuery, [
          data.site_images[i],
          i,
        ]);
      }
    }

    return { success: true, message: 'تم تحديث الإعدادات بنجاح' };
  }
}
