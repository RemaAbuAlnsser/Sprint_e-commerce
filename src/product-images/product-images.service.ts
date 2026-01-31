import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductImagesService {
  constructor(private databaseService: DatabaseService) {}

  async findByProduct(productId: number) {
    const query = `
      SELECT * FROM product_images 
      WHERE product_id = ? 
      ORDER BY display_order ASC, id ASC
    `;
    return this.databaseService.query(query, [productId]);
  }

  async create(imageData: any) {
    console.log('ProductImagesService.create called with:', imageData);
    
    const query = `
      INSERT INTO product_images (product_id, image_url, display_order)
      VALUES (?, ?, ?)
    `;
    const values = [
      imageData.product_id,
      imageData.image_url,
      imageData.display_order || 0,
    ];

    console.log('Executing query:', query);
    console.log('With values:', values);

    try {
      const result: any = await this.databaseService.query(query, values);
      console.log('Insert result:', result);
      
      return {
        success: true,
        id: result.insertId,
        message: 'Product image added successfully',
      };
    } catch (error) {
      console.error('Error inserting product image:', error);
      return {
        success: false,
        message: 'Failed to add product image',
        error: error.message,
      };
    }
  }

  async remove(id: number) {
    const query = 'DELETE FROM product_images WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return {
      success: true,
      message: 'Product image deleted successfully',
    };
  }
}
