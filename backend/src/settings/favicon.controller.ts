import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SettingsService } from './settings.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class FaviconController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('favicon.ico')
  async getFavicon(@Res() res: Response) {
    try {
      // Get site logo from settings
      const settings = await this.settingsService.getSettings();
      
      if (settings && settings.site_logo) {
        // Remove leading slash if present
        const logoPath = settings.site_logo.startsWith('/') 
          ? settings.site_logo.substring(1) 
          : settings.site_logo;
        
        const fullPath = path.join(process.cwd(), logoPath);
        
        // Check if file exists
        if (fs.existsSync(fullPath)) {
          // Set appropriate headers
          res.setHeader('Content-Type', 'image/x-icon');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
          
          // Stream the file
          const fileStream = fs.createReadStream(fullPath);
          fileStream.pipe(res);
          return;
        }
      }
      
      // Fallback to default favicon if no logo or file not found
      const defaultFaviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
      if (fs.existsSync(defaultFaviconPath)) {
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const fileStream = fs.createReadStream(defaultFaviconPath);
        fileStream.pipe(res);
      } else {
        // Return 404 if no favicon available
        res.status(404).send('Favicon not found');
      }
      
    } catch (error) {
      console.error('Favicon error:', error);
      res.status(500).send('Internal server error');
    }
  }

  @Get('apple-touch-icon.png')
  async getAppleTouchIcon(@Res() res: Response) {
    try {
      // Get site logo from settings for Apple touch icon
      const settings = await this.settingsService.getSettings();
      
      if (settings && settings.site_logo) {
        const logoPath = settings.site_logo.startsWith('/') 
          ? settings.site_logo.substring(1) 
          : settings.site_logo;
        
        const fullPath = path.join(process.cwd(), logoPath);
        
        if (fs.existsSync(fullPath)) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          
          const fileStream = fs.createReadStream(fullPath);
          fileStream.pipe(res);
          return;
        }
      }
      
      // Fallback
      const defaultIconPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
      if (fs.existsSync(defaultIconPath)) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const fileStream = fs.createReadStream(defaultIconPath);
        fileStream.pipe(res);
      } else {
        res.status(404).send('Apple touch icon not found');
      }
      
    } catch (error) {
      console.error('Apple touch icon error:', error);
      res.status(500).send('Internal server error');
    }
  }
}
