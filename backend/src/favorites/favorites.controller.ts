import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { UserJwtPayload } from '../auth/strategies/jwt-user.strategy';

interface UserRequest {
  user: UserJwtPayload;
}

@UseGuards(UserJwtGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Request() req: UserRequest) {
    return this.favoritesService.list(req.user.sub);
  }

  @Get('ids')
  listIds(@Request() req: UserRequest) {
    return this.favoritesService.listIds(req.user.sub);
  }

  @Post(':tourId')
  add(@Request() req: UserRequest, @Param('tourId') tourId: string) {
    return this.favoritesService.add(req.user.sub, tourId);
  }

  @Delete(':tourId')
  remove(@Request() req: UserRequest, @Param('tourId') tourId: string) {
    return this.favoritesService.remove(req.user.sub, tourId);
  }
}
