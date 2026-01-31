import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CompaniesService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const query = 'SELECT * FROM companies ORDER BY created_at DESC';
    return this.databaseService.query(query);
  }

  async findOne(id: number) {
    const query = 'SELECT * FROM companies WHERE id = ?';
    const companies: any = await this.databaseService.query(query, [id]);
    return companies[0] || null;
  }

  async create(data: any) {
    const query = 'INSERT INTO companies (name, logo_url) VALUES (?, ?)';
    const result: any = await this.databaseService.query(query, [
      data.name,
      data.logo_url || null,
    ]);

    return { success: true, id: result.insertId, message: 'تم إضافة الشركة بنجاح' };
  }

  async update(id: number, data: any) {
    const query = 'UPDATE companies SET name = ?, logo_url = ? WHERE id = ?';
    await this.databaseService.query(query, [
      data.name,
      data.logo_url,
      id,
    ]);
    return { success: true, message: 'تم تحديث الشركة بنجاح' };
  }

  async remove(id: number) {
    const query = 'DELETE FROM companies WHERE id = ?';
    await this.databaseService.query(query, [id]);
    return { success: true, message: 'تم حذف الشركة بنجاح' };
  }
}
