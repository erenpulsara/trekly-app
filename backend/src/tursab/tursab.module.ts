import { Module } from '@nestjs/common';
import { TursabController } from './tursab.controller';
import { TursabService } from './tursab.service';

@Module({
  controllers: [TursabController],
  providers: [TursabService],
})
export class TursabModule {}
