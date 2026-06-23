import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AgencyLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
