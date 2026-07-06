import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';
import { WebBooking } from '../entities/web-booking.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPointsLog, WebBooking])],
  controllers: [UsersController, LeaderboardController],
  providers: [UsersService],
})
export class UsersModule {}
