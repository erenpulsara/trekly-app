import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { TursabService } from './tursab.service';

@Controller('tursab')
export class TursabController {
  constructor(private readonly tursabService: TursabService) {}

  @Get('verify/:no')
  async verify(@Param('no') no: string) {
    if (!no || !/^\d{1,6}$/.test(no.trim())) {
      throw new BadRequestException('Geçersiz belge numarası');
    }
    return this.tursabService.verify(no);
  }
}
