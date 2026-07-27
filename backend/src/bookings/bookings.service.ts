import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { Tour } from '../entities/tour.entity';
import { TourDate } from '../entities/tour-date.entity';
import { WebBooking } from '../entities/web-booking.entity';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Tour)
    private tourRepo: Repository<Tour>,
    @InjectRepository(TourDate)
    private tourDateRepo: Repository<TourDate>,
    @InjectRepository(WebBooking)
    private webBookingRepo: Repository<WebBooking>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserPointsLog)
    private pointsLogRepo: Repository<UserPointsLog>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User account not found. Please log out and register again.');

    const tour = await this.tourRepo.findOne({
      where: { id: dto.tour_id, status: 'published' },
    });
    if (!tour) throw new NotFoundException('Tour not found or not published');

    const tourDate = await this.tourDateRepo.findOne({
      where: { id: dto.tour_date_id, tour_id: dto.tour_id },
    });
    if (!tourDate) throw new NotFoundException('Tour date not found');

    const participantCount = dto.participant_count ?? 1;
    // available_slots o tarihin TOPLAM kontenjanı, rezervasyon geldikçe
    // azalmaz — gerçek kalan yeri bulmak için o tarihe (tour_date_id) daha
    // önce yapılmış rezervasyonlar ayrıca toplanıp düşülür. Aksi halde aynı
    // tarihe art arda rezervasyon yapılabilir (overbooking) çünkü kontenjan
    // hiç dolmuyormuş gibi görünür.
    const alreadyBooked = await this.getBookedCountForDate(dto.tour_date_id);
    if (alreadyBooked + participantCount > tourDate.available_slots) {
      throw new BadRequestException('Not enough available slots');
    }

    const booking = this.bookingRepo.create({
      tour_id: dto.tour_id,
      tour_date_id: dto.tour_date_id,
      user_id: userId,
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      phone: dto.phone,
      participant_count: participantCount,
      notes: dto.notes ?? null,
      status: 'pending',
    });

    return this.bookingRepo.save(booking);
  }

  // Belirli bir tarih seçeneğine (tour_date_id) yapılmış, iptal edilmemiş tüm
  // rezervasyonların (native Booking + web WebBooking) katılımcı sayısı toplamı.
  private async getBookedCountForDate(tourDateId: string): Promise<number> {
    const [mobileRow, webRow] = await Promise.all([
      this.bookingRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.participant_count), 0)', 'total')
        .where('b.tour_date_id = :tourDateId', { tourDateId })
        .andWhere("b.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
      this.webBookingRepo
        .createQueryBuilder('wb')
        .select('COALESCE(SUM(wb.participant_count), 0)', 'total')
        .where('wb.tour_date_id = :tourDateId', { tourDateId })
        .andWhere("wb.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
    ]);
    return (
      parseInt(mobileRow?.total ?? '0', 10) + parseInt(webRow?.total ?? '0', 10)
    );
  }

  async findById(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, user_id: userId },
      relations: ['tour', 'tour_date'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findMyBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { user_id: userId },
      relations: ['tour', 'tour_date'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(
    bookingId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['tour'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const previousStatus = booking.status;
    booking.status = dto.status;

    await this.bookingRepo.save(booking);

    // Award points when booking becomes 'completed'
    if (dto.status === 'completed' && previousStatus !== 'completed') {
      await this.awardPoints(booking);
    }

    return booking;
  }

  private async awardPoints(booking: Booking): Promise<void> {
    const tour = await this.tourRepo.findOne({ where: { id: booking.tour_id } });
    if (!tour) return;

    const pointsEarned = tour.points;

    await this.dataSource.transaction(async (manager) => {
      // Insert points log
      const log = manager.create(UserPointsLog, {
        user_id: booking.user_id,
        tour_id: booking.tour_id,
        booking_id: booking.id,
        points_earned: pointsEarned,
      });
      await manager.save(log);

      // Increment user total_points
      await manager.query(
        `UPDATE users SET total_points = total_points + $1 WHERE id = $2`,
        [pointsEarned, booking.user_id],
      );
    });
  }
}
