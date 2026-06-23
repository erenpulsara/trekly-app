import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface AgencyJwtPayload {
  sub: string;
  email: string;
  type: 'agency';
}

@Injectable()
export class JwtAgencyStrategy extends PassportStrategy(Strategy, 'jwt-agency') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_AGENCY_SECRET') ?? '',
    });
  }

  validate(payload: AgencyJwtPayload): AgencyJwtPayload {
    if (payload.type !== 'agency') {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload;
  }
}
