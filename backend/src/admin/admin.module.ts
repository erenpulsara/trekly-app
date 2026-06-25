import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAdminStrategy } from '../auth/strategies/jwt-admin.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Agency, Tour]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtAdminStrategy],
})
export class AdminModule {}
