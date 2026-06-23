import { IsDateString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTourDateDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  available_slots!: number;
}
