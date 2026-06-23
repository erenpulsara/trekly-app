import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from '../entities/tour.entity';
import { TourDate } from '../entities/tour-date.entity';
import { Booking } from '../entities/booking.entity';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { AgencyToursController } from './agency-tours.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, TourDate, Booking]), ConfigModule, MediaModule],
  controllers: [ToursController, AgencyToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
