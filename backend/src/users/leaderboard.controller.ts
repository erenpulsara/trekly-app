import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { UserJwtPayload } from '../auth/strategies/jwt-user.strategy';

interface UserRequest {
  user: UserJwtPayload;
}

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly usersService: UsersService) {}

  // Public top list — surnames are shortened to an initial for privacy
  @Get()
  getLeaderboard() {
    return this.usersService.getLeaderboard(50);
  }

  // The logged-in user's own rank
  @UseGuards(UserJwtGuard)
  @Get('me')
  getMyRank(@Request() req: UserRequest) {
    return this.usersService.getMyRank(req.user.sub);
  }
}
