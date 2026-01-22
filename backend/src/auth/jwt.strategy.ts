import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'sprint-secret-key-2026',
    });
  }

  async validate(payload: any) {
    const query = 'SELECT id, email, name, role FROM users WHERE id = ?';
    const users: any = await this.databaseService.query(query, [payload.sub]);

    if (users.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: users[0].id,
      email: users[0].email,
      name: users[0].name,
      role: users[0].role,
    };
  }
}
