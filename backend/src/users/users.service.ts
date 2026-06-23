import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPointsLog)
    private pointsLogRepo: Repository<UserPointsLog>,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...profile } = user;
    return profile as Omit<User, 'password_hash'>;
  }

  async getPointsHistory(userId: string): Promise<UserPointsLog[]> {
    return this.pointsLogRepo.find({
      where: { user_id: userId },
      relations: ['tour'],
      order: { awarded_at: 'DESC' },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.userRepo.delete({ id: userId });
  }
}
