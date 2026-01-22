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
      const insertQuery = `
        INSERT INTO settings (
          site_logo, site_image, site_name, site_description,
          contact_email, contact_phone, address,
          facebook_url, instagram_url, whatsapp_url
        ) VALUES (NULL, NULL, 'Sprint Store', 'متجر إلكتروني متكامل', NULL, NULL, NULL, NULL, NULL, NULL)
      `;
      await this.databaseService.query(insertQuery);
      return { 
        site_logo: null, 
        site_image: null, 
        site_images: [],
        site_name: 'Sprint Store',
        site_description: 'متجر إلكتروني متكامل',
        contact_email: null,
        contact_phone: null,
        address: null,
        facebook_url: null,
        instagram_url: null,
        whatsapp_url: null
      };
    }
    
    // Get site images
    const imagesQuery = 'SELECT * FROM site_images ORDER BY display_order ASC, id ASC';
    const siteImages: any = await this.databaseService.query(imagesQuery);
    
    return {
      ...result[0],
      site_images: siteImages,
    };
  }

  async updateSettings(data: { 
    site_logo?: string; 
    site_image?: string; 
    site_images?: string[]; 
    current_site_images?: any[];
    site_name?: string;
    site_description?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    facebook_url?: string;
    instagram_url?: string;
    whatsapp_url?: string;
  }) {
    // Get current settings
    const current: any = await this.getSettings();
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (data.site_logo !== undefined) {
      updateFields.push('site_logo = ?');
      updateValues.push(data.site_logo);
    }
    
    if (data.site_image !== undefined) {
      updateFields.push('site_image = ?');
      updateValues.push(data.site_image);
    }
    
    if (data.site_name !== undefined) {
      updateFields.push('site_name = ?');
      updateValues.push(data.site_name);
    }
    
    if (data.site_description !== undefined) {
      updateFields.push('site_description = ?');
      updateValues.push(data.site_description);
    }
    
    if (data.contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      updateValues.push(data.contact_email);
    }
    
    if (data.contact_phone !== undefined) {
      updateFields.push('contact_phone = ?');
      updateValues.push(data.contact_phone);
    }
    
    if (data.address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(data.address);
    }
    
    if (data.facebook_url !== undefined) {
      updateFields.push('facebook_url = ?');
      updateValues.push(data.facebook_url);
    }
    
    if (data.instagram_url !== undefined) {
      updateFields.push('instagram_url = ?');
      updateValues.push(data.instagram_url);
    }
    
    if (data.whatsapp_url !== undefined) {
      updateFields.push('whatsapp_url = ?');
      updateValues.push(data.whatsapp_url);
    }

    // Execute update if there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(current.id);
      const query = `UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`;
      await this.databaseService.query(query, updateValues);
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
