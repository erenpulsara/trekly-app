import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { UserJwtPayload } from '../auth/strategies/jwt-user.strategy';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface UserRequest {
  user: UserJwtPayload;
}

@UseGuards(UserJwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: UserRequest) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('me')
  updateMe(@Request() req: UserRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Get('me/points')
  getMyPoints(@Request() req: UserRequest) {
    return this.usersService.getPointsHistory(req.user.sub);
  }

  @Get('me/web-bookings')
  getMyWebBookings(@Request() req: UserRequest) {
    return this.usersService.getWebBookingsByEmail(req.user.email);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req: UserRequest): Promise<{ message: string }> {
    await this.usersService.deleteAccount(req.user.sub);
    return { message: 'Account deleted' };
  }
}
