import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private connection: mysql.Connection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: this.configService.get<string>('DB_HOST'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      port: this.configService.get<number>('DB_PORT'),
    });
    console.log('Connected to MySQL database');
  }

  getConnection(): mysql.Connection {
    return this.connection;
  }

  async query(sql: string, params?: any[]) {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }
}
