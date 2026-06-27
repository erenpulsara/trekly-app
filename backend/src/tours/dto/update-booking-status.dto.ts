import { IsEnum } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled'])
  status!: string;
}

export class UpdateWebBookingStatusDto {
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status!: string;
}
