import { Controller, Get, Param, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { TourQueryDto } from './dto/tour-query.dto';

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
}
