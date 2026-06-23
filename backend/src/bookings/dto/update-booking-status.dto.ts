import { IsEnum } from 'class-validator';
import { BookingStatus } from '../../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled'])
  status!: BookingStatus;
}
