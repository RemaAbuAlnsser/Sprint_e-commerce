import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async exportAllTables(): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const tables = [
        'users', 'categories', 'subcategories', 'companies', 'products',
        'product_colors', 'product_images', 'product_color_images',
        'orders', 'order_items', 'settings', 'site_images'
      ];

      const exportData: any = {};
      
      for (const table of tables) {
        const query = `SELECT * FROM ${table}`;
        const data = await this.databaseService.query(query);
        exportData[table] = data;
      }

      return {
        success: true,
        data: exportData,
        message: 'تم تصدير جميع البيانات بنجاح'
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        data: null,
        message: 'حدث خطأ أثناء تصدير البيانات'
      };
    }
  }

  async exportTable(tableName: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const allowedTables = [
        'users', 'categories', 'subcategories', 'companies', 'products',
        'product_colors', 'product_images', 'product_color_images',
        'orders', 'order_items', 'settings', 'site_images'
      ];

      if (!allowedTables.includes(tableName)) {
        return {
          success: false,
          data: null,
          message: 'اسم الجدول غير صحيح'
        };
      }

      const query = `SELECT * FROM ${tableName}`;
      const data = await this.databaseService.query(query);

      return {
        success: true,
        data: { [tableName]: data },
        message: `تم تصدير جدول ${tableName} بنجاح`
      };
    } catch (error) {
      console.error('Export table error:', error);
      return {
        success: false,
        data: null,
        message: 'حدث خطأ أثناء تصدير الجدول'
      };
    }
  }

  async createSQLDump(): Promise<{ success: boolean; filePath?: string; message: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `sprint_db_backup_${timestamp}.sql`;
      const filePath = path.join(process.cwd(), 'exports', fileName);

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Get database structure and data
      const tables = [
        'users', 'categories', 'subcategories', 'companies', 'products',
        'product_colors', 'product_images', 'product_color_images',
        'orders', 'order_items', 'settings', 'site_images'
      ];

      let sqlDump = `-- Sprint E-Commerce Database Backup\n`;
      sqlDump += `-- Generated on: ${new Date().toISOString()}\n`;
      sqlDump += `-- Database: SprintDB\n\n`;
      sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      for (const table of tables) {
        // Get table structure
        const createTableQuery = `SHOW CREATE TABLE ${table}`;
        const createTableResult: any = await this.databaseService.query(createTableQuery);
        
        sqlDump += `-- Table structure for ${table}\n`;
        sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        sqlDump += `${createTableResult[0]['Create Table']};\n\n`;

        // Get table data
        const selectQuery = `SELECT * FROM ${table}`;
        const tableData: any = await this.databaseService.query(selectQuery);

        if (tableData.length > 0) {
          sqlDump += `-- Data for table ${table}\n`;
          sqlDump += `INSERT INTO \`${table}\` VALUES\n`;

          const values = tableData.map((row: any) => {
            const rowValues = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return value;
            });
            return `(${rowValues.join(', ')})`;
          });

          sqlDump += values.join(',\n') + ';\n\n';
        }
      }

      sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

      // Write to file
      fs.writeFileSync(filePath, sqlDump, 'utf8');

      return {
        success: true,
        filePath: fileName,
        message: 'تم إنشاء ملف SQL بنجاح'
      };
    } catch (error) {
      console.error('SQL dump error:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء إنشاء ملف SQL'
      };
    }
  }

  async getTableStats(): Promise<{ success: boolean; stats: any; message: string }> {
    try {
      const tables = [
        'users', 'categories', 'subcategories', 'companies', 'products',
        'product_colors', 'product_images', 'product_color_images',
        'orders', 'order_items', 'settings', 'site_images'
      ];

      const stats: any = {};
      
      for (const table of tables) {
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const result: any = await this.databaseService.query(countQuery);
        stats[table] = result[0].count;
      }

      return {
        success: true,
        stats,
        message: 'تم جلب إحصائيات الجداول بنجاح'
      };
    } catch (error) {
      console.error('Stats error:', error);
      return {
        success: false,
        stats: null,
        message: 'حدث خطأ أثناء جلب الإحصائيات'
      };
    }
  }
}
