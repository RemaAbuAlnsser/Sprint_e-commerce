import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import * as path from 'path';
import * as fs from 'fs';

@Controller('export')
@UseGuards(AdminAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('all')
  async exportAllTables() {
    return await this.exportService.exportAllTables();
  }

  @Get('table/:tableName')
  async exportTable(@Param('tableName') tableName: string) {
    return await this.exportService.exportTable(tableName);
  }

  @Get('stats')
  async getTableStats() {
    return await this.exportService.getTableStats();
  }

  @Post('sql-dump')
  async createSQLDump() {
    return await this.exportService.createSQLDump();
  }

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = path.join(process.cwd(), 'exports', fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'الملف غير موجود'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Download error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تحميل الملف'
      });
    }
  }

  @Get('json/all')
  async exportAllTablesAsJSON(@Res() res: Response) {
    try {
      const result = await this.exportService.exportAllTables();
      
      if (result.success) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `sprint_db_export_${timestamp}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        return res.json({
          exportDate: new Date().toISOString(),
          database: 'SprintDB',
          tables: result.data
        });
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error('JSON export error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تصدير البيانات'
      });
    }
  }

  @Get('json/table/:tableName')
  async exportTableAsJSON(@Param('tableName') tableName: string, @Res() res: Response) {
    try {
      const result = await this.exportService.exportTable(tableName);
      
      if (result.success) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${tableName}_export_${timestamp}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        return res.json({
          exportDate: new Date().toISOString(),
          database: 'SprintDB',
          table: tableName,
          data: result.data[tableName]
        });
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error('Table JSON export error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تصدير الجدول'
      });
    }
  }
}
