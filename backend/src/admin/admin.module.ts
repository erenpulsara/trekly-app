import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agency, Tour]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
