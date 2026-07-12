import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppleAuthDto {
  @IsString()
  @IsNotEmpty()
  identityToken!: string;

  // Apple, ad/soyad bilgisini sadece İLK girişte gönderir; sonraki
  // girişlerde bu alan boş gelir. İlk kayıtta kullanılır.
  @IsOptional()
  @IsString()
  fullName?: string;
}
