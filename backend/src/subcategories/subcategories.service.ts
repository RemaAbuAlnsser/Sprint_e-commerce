import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SubcategoriesService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = `
      SELECT s.*, c.name as category_name 
      FROM subcategories s 
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `;
    return this.databaseService.query(query);
  }

  async findByCategory(categoryId: number) {
    const query = 'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name';
    return this.databaseService.query(query, [categoryId]);
  }

  async findOne(id: number) {
    const query = `
      SELECT s.*, c.name as category_name 
      FROM subcategories s 
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `;
    const subcategories: any = await this.databaseService.query(query, [id]);
    return subcategories[0] || null;
  }

  async create(data: any) {
    const query = 'INSERT INTO subcategories (category_id, name, description, image_url) VALUES (?, ?, ?, ?)';
    const result: any = await this.databaseService.query(query, [
      data.category_id,
      data.name,
      data.description || null,
      data.image_url || null,
    ]);

    return { success: true, id: result.insertId, message: 'تم إضافة الفئة الفرعية بنجاح' };
  }

  async update(id: number, data: any) {
    const query = 'UPDATE subcategories SET category_id = ?, name = ?, description = ?, image_url = ? WHERE id = ?';
    await this.databaseService.query(query, [
      data.category_id,
      data.name,
      data.description,
      data.image_url,
      id,
    ]);
    return { success: true, message: 'تم تحديث الفئة الفرعية بنجاح' };
  }

  async remove(id: number) {
    const query = 'DELETE FROM subcategories WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return { success: true, message: 'تم حذف الفئة الفرعية بنجاح' };
  }
}
