import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTourDateDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  available_slots!: number;
}
