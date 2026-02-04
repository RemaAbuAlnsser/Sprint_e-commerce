import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database pool closed');
    }
  }

  async connect() {
    this.pool = mysql.createPool({
      host: this.configService.get<string>('DB_HOST'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      port: this.configService.get<number>('DB_PORT'),
      
      // Connection Pool Settings
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      
      // Reconnection Settings
      waitForConnections: true,
      connectTimeout: 10000,
    });
    
    // Test connection
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to MySQL database with connection pool');
      connection.release();
    } catch (error) {
      console.error('❌ Failed to connect to MySQL:', error);
      throw error;
    }
  }

  getPool(): mysql.Pool {
    return this.pool;
  }

  async query(sql: string, params?: any[]) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}