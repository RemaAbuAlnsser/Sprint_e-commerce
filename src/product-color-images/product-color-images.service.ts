import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductColorImagesService {
  constructor(private databaseService: DatabaseService) {}

  async getColorImages(colorId: number) {
    const query = `
      SELECT * FROM product_color_images 
      WHERE product_color_id = ? 
      ORDER BY display_order ASC, id ASC
    `;
    return this.databaseService.query(query, [colorId]);
  }

  async create(imageData: any) {
    const query = `
      INSERT INTO product_color_images (product_color_id, image_url, display_order)
      VALUES (?, ?, ?)
    `;
    const values = [
      imageData.product_color_id,
      imageData.image_url,
      imageData.display_order || 0,
    ];
    
    const result: any = await this.databaseService.query(query, values);
    return {
      success: true,
      id: result.insertId,
      message: 'تم إضافة الصورة بنجاح',
    };
  }

  async remove(id: number) {
    const query = 'DELETE FROM product_color_images WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return {
      success: true,
      message: 'تم حذف الصورة بنجاح',
    };
  }
}
