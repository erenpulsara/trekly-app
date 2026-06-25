import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  type: 'admin';
}

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_AGENCY_SECRET') ?? '',
    });
  }

  validate(payload: AdminJwtPayload): AdminJwtPayload {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload;
  }
}
