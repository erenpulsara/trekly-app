import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TourDifficulty } from '../../entities/tour.entity';

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location_name!: string;

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

  @IsEnum(['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard', 'extreme'])
  difficulty!: TourDifficulty;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  distance_km?: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  max_participants!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photo_urls?: string[];

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsEnum(['TRY', 'USD', 'EUR'])
  price_currency?: 'TRY' | 'USD' | 'EUR';

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

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
