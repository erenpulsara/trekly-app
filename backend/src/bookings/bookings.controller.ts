import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { AgencyJwtGuard } from '../auth/guards/agency-jwt.guard';
import { UserJwtPayload } from '../auth/strategies/jwt-user.strategy';

interface UserRequest {
  user: UserJwtPayload;
}

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ── User endpoints ────────────────────────────────────────────────────────

  @UseGuards(UserJwtGuard)
  @Post('bookings')
  createBooking(@Request() req: UserRequest, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  @UseGuards(UserJwtGuard)
  @Get('bookings/my')
  getMyBookings(@Request() req: UserRequest) {
    return this.bookingsService.findMyBookings(req.user.sub);
  }

  @UseGuards(UserJwtGuard)
  @Get('bookings/:id')
  getBookingById(@Request() req: UserRequest, @Param('id') id: string) {
    return this.bookingsService.findById(id, req.user.sub);
  }

  // ── Agency endpoint ───────────────────────────────────────────────────────

  @UseGuards(AgencyJwtGuard)
  @Put('agency/bookings/:id/status')
  updateBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
