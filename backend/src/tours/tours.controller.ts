import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { TourQueryDto } from './dto/tour-query.dto';
import { CreateWebBookingDto } from './dto/create-web-booking.dto';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  findAll(@Query() query: TourQueryDto) {
    return this.toursService.findAllPublished(query);
  }

  @Get('categories')
  findCategories() {
    return this.toursService.findPublishedCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOnePublished(id);
  }

  @Post(':id/web-booking')
  createWebBooking(@Param('id') id: string, @Body() dto: CreateWebBookingDto) {
    return this.toursService.createWebBooking(id, dto);
  }
}
