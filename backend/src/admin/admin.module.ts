import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';
import { Booking } from '../entities/booking.entity';
import { BlogPost } from '../entities/blog-post.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agency, Tour, Booking, BlogPost, Category, User]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
