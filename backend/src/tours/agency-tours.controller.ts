import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { AgencyJwtGuard } from '../auth/guards/agency-jwt.guard';
import { AgencyJwtPayload } from '../auth/strategies/jwt-agency.strategy';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDateDto } from './dto/create-tour-date.dto';

interface AgencyRequest {
  user: AgencyJwtPayload;
}

@UseGuards(AgencyJwtGuard)
@Controller('agency')
export class AgencyToursController {
  constructor(private readonly toursService: ToursService) {}

  // ── Tours ─────────────────────────────────────────────────────────────────

  @Get('tours')
  getMyTours(@Request() req: AgencyRequest) {
    return this.toursService.findAgencyTours(req.user.sub);
  }

  @Get('tours/:id')
  getTour(@Request() req: AgencyRequest, @Param('id') id: string) {
    return this.toursService.findAgencyTour(req.user.sub, id);
  }

  @Post('tours')
  createTour(@Request() req: AgencyRequest, @Body() dto: CreateTourDto) {
    return this.toursService.createTour(req.user.sub, dto);
  }

  @Put('tours/:id')
  updateTour(
    @Request() req: AgencyRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTourDto,
  ) {
    return this.toursService.updateTour(req.user.sub, id, dto);
  }

  @Delete('tours/:id')
  deleteTour(@Request() req: AgencyRequest, @Param('id') id: string) {
    return this.toursService.deleteTour(req.user.sub, id);
  }

  // ── Dates ─────────────────────────────────────────────────────────────────

  @Post('tours/:id/dates')
  addDate(
    @Request() req: AgencyRequest,
    @Param('id') id: string,
    @Body() dto: CreateTourDateDto,
  ) {
    return this.toursService.addDate(req.user.sub, id, dto);
  }

  @Delete('tours/:id/dates/:dateId')
  removeDate(
    @Request() req: AgencyRequest,
    @Param('id') id: string,
    @Param('dateId') dateId: string,
  ) {
    return this.toursService.removeDate(req.user.sub, id, dateId);
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  @Get('tours/:id/bookings')
  getTourBookings(@Request() req: AgencyRequest, @Param('id') id: string) {
    return this.toursService.getTourBookings(req.user.sub, id);
  }
}
