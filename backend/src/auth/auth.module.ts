import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Agency } from '../entities/agency.entity';
import { User } from '../entities/user.entity';
import { VerificationToken } from '../entities/verification-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAgencyStrategy } from './strategies/jwt-agency.strategy';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Agency, User, VerificationToken]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAgencyStrategy, JwtUserStrategy, JwtAdminStrategy],
  exports: [AuthService],
})
export class AuthModule {}
