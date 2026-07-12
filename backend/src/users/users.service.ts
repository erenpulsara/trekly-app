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
    if (dto.avatar_url !== undefined) user.avatar_url = dto.avatar_url.trim() || null;

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

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async getLeaderboard(limit = 50): Promise<Array<{
    rank: number;
    name: string;
    surname_initial: string;
    total_points: number;
  }>> {
    const users = await this.userRepo.find({
      select: ['id', 'name', 'surname', 'total_points'],
      where: { is_banned: false },
      order: { total_points: 'DESC', created_at: 'ASC' },
      take: limit,
    });

    return users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      surname_initial: u.surname ? `${u.surname.charAt(0).toUpperCase()}.` : '',
      total_points: u.total_points,
    }));
  }

  async getMyRank(userId: string): Promise<{ rank: number; total_points: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const higher = await this.userRepo
      .createQueryBuilder('u')
      .where('u.total_points > :pts', { pts: user.total_points })
      .andWhere('u.is_banned = false')
      .getCount();

    return { rank: higher + 1, total_points: user.total_points };
  }
}
