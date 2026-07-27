import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebBookingDto {
  @IsString()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  // Tur birden fazla tarih aralığı sunuyorsa, ziyaretçinin seçtiği tarih.
  @IsOptional()
  @IsUUID()
  tour_date_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  participant_count?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
