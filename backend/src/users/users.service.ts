import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';
import { WebBooking } from '../entities/web-booking.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPointsLog)
    private pointsLogRepo: Repository<UserPointsLog>,
    @InjectRepository(WebBooking)
    private webBookingRepo: Repository<WebBooking>,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...profile } = user;
    return profile as Omit<User, 'password_hash'>;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.surname !== undefined) user.surname = dto.surname.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim() || null;

    await this.userRepo.save(user);

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

  // Web bookings are guest records keyed by email — surface the ones matching
  // the logged-in user's email so their reservations show on the profile.
  async getWebBookingsByEmail(email: string): Promise<WebBooking[]> {
    return this.webBookingRepo.find({
      where: { email },
      relations: ['tour'],
      order: { created_at: 'DESC' },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.userRepo.delete({ id: userId });
  }
}
