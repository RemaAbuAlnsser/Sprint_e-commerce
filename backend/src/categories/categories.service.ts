import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = 'SELECT * FROM categories ORDER BY name';
    return this.databaseService.query(query);
  }

  async findAllWithSubcategories() {
    const categoriesQuery = 'SELECT * FROM categories ORDER BY name';
    const categories: any = await this.databaseService.query(categoriesQuery);
    
    for (const category of categories) {
      const subcategoriesQuery = 'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name';
      const subcategories = await this.databaseService.query(subcategoriesQuery, [category.id]);
      category.subcategories = subcategories;
    }
    
    return categories;
  }

  async findOne(id: number) {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const categories: any = await this.databaseService.query(query, [id]);
    return categories[0] || null;
  }

  async create(data: any) {
    const query = 'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)';
    const result: any = await this.databaseService.query(query, [
      data.name,
      data.description || null,
      data.image_url || null,
    ]);

    return { success: true, id: result.insertId, message: 'تم إضافة الفئة بنجاح' };
  }

  async update(id: number, data: any) {
    const query = 'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?';
    await this.databaseService.query(query, [
      data.name,
      data.description,
      data.image_url,
      id,
    ]);
    return { success: true, message: 'تم تحديث الفئة بنجاح' };
  }

  async remove(id: number) {
    const query = 'DELETE FROM categories WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return { success: true, message: 'تم حذف الفئة بنجاح' };
  }
}
