import { Controller, Delete, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { UserJwtPayload } from '../auth/strategies/jwt-user.strategy';

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

  @Get('me/points')
  getMyPoints(@Request() req: UserRequest) {
    return this.usersService.getPointsHistory(req.user.sub);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req: UserRequest): Promise<{ message: string }> {
    await this.usersService.deleteAccount(req.user.sub);
    return { message: 'Account deleted' };
  }
}
