import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TourDifficulty, TourStatus } from '../../entities/tour.entity';

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location_name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  altitude_meters?: number;

  @IsOptional()
  @IsEnum(['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard', 'extreme'])
  difficulty?: TourDifficulty;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  distance_km?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  max_participants?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photo_urls?: string[];

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: TourStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsEnum(['TRY', 'USD', 'EUR'])
  price_currency?: 'TRY' | 'USD' | 'EUR';

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  guide_name?: string;

  @IsOptional()
  @IsString()
  guide_instagram?: string;

  @IsOptional()
  @IsString()
  tursab_no?: string;

  @IsOptional()
  @IsString()
  meeting_points?: string;

  @IsOptional()
  @IsString()
  target_location?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  accommodation?: string;

  @IsOptional()
  @IsString()
  accommodation_url?: string;

  @IsOptional()
  @IsString()
  transportation?: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  important_notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  organizer?: string;
}
