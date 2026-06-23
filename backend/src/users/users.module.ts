import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPointsLog])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
