import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  async login(email: string, password: string) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const users: any = await this.databaseService.query(query, [email]);

    if (users.length === 0) {
      return { success: false, message: 'المستخدم غير موجود' };
    }

    const user = users[0];

    // Simple password check (في الإنتاج استخدم bcrypt)
    if (password === 'admin123' && email === 'admin@sprint.com') {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: 'dummy-jwt-token',
      };
    }

    return { success: false, message: 'كلمة المرور غير صحيحة' };
  }

  async register(data: { email: string; password: string; name: string }) {
    const query = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
    
    try {
      await this.databaseService.query(query, [
        data.email,
        data.password,
        data.name,
        'customer',
      ]);

      return { success: true, message: 'تم التسجيل بنجاح' };
    } catch (error) {
      return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };
    }
  }
}
