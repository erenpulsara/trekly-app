import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TourDifficulty } from '../../entities/tour.entity';

export class TourQueryDto {
  @IsOptional()
  @IsEnum(['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'very_hard', 'extreme'])
  difficulty?: TourDifficulty;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
