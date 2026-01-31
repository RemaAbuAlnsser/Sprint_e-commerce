import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(email: string, password: string) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const users: any = await this.databaseService.query(query, [email]);

    if (users.length === 0) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    // التحقق من أن المستخدم مدير
    if (user.role !== 'admin') {
      throw new UnauthorizedException('ليس لديك صلاحية للوصول إلى لوحة التحكم');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async registerAdmin(data: { email: string; password: string; name: string }) {
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const existingUsers: any = await this.databaseService.query(checkQuery, [data.email]);

    if (existingUsers.length > 0) {
      throw new UnauthorizedException('البريد الإلكتروني مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const insertQuery = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
    
    try {
      const result: any = await this.databaseService.query(insertQuery, [
        data.email,
        hashedPassword,
        data.name,
        'admin',
      ]);

      const payload = { email: data.email, sub: result.insertId, role: 'admin' };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'تم التسجيل بنجاح',
        access_token: token,
        user: {
          id: result.insertId,
          email: data.email,
          name: data.name,
          role: 'customer',
        },
      };
    } catch (error) {
      throw new UnauthorizedException('فشل في إنشاء الحساب');
    }
  }

  async validateUser(userId: number) {
    const query = 'SELECT id, email, name, role FROM users WHERE id = ?';
    const users: any = await this.databaseService.query(query, [userId]);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async updateUserRole(userId: number, role: string) {
    const query = 'UPDATE users SET role = ? WHERE id = ?';
    await this.databaseService.query(query, [role, userId]);
    
    return {
      success: true,
      message: 'تم تحديث دور المستخدم بنجاح',
    };
  }

  async makeUserAdmin(email: string) {
    const query = 'UPDATE users SET role = ? WHERE email = ?';
    await this.databaseService.query(query, ['admin', email]);
    
    return {
      success: true,
      message: 'تم تحديث المستخدم إلى مدير بنجاح',
    };
  }
}
