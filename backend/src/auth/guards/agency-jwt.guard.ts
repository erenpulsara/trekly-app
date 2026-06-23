import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AgencyJwtGuard extends AuthGuard('jwt-agency') {}
