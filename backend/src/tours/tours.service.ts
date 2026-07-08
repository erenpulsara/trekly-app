import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Tour } from '../entities/tour.entity';
import { TourDate } from '../entities/tour-date.entity';
import { Booking } from '../entities/booking.entity';
import { WebBooking } from '../entities/web-booking.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { UserPointsLog } from '../entities/user-points-log.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDateDto } from './dto/create-tour-date.dto';
import { CreateWebBookingDto } from './dto/create-web-booking.dto';
import { TourQueryDto } from './dto/tour-query.dto';
import { calculatePoints } from '../common/points.calculator';
import { slugify } from '../common/slugify';
import { MediaService } from '../media/media.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private tourRepo: Repository<Tour>,
    @InjectRepository(TourDate)
    private tourDateRepo: Repository<TourDate>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(WebBooking)
    private webBookingRepo: Repository<WebBooking>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ── Public ───────────────────────────────────────────────────────────────

  async findAllPublished(query: TourQueryDto): Promise<Tour[]> {
    const qb = this.tourRepo
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.dates', 'dates')
      .where('tour.status = :status', { status: 'published' });

    if (query.difficulty) {
      qb.andWhere('tour.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    if (query.location) {
      qb.andWhere('tour.location_name ILIKE :location', {
        location: `%${query.location}%`,
      });
    }

    if (query.date) {
      qb.andWhere('dates.date = :date', { date: query.date });
    }

    if (query.category) {
      // tour.category may hold multiple comma-separated categories
      // (e.g. "Trekking, Dağcılık, Kamp"), so match on any one of them.
      qb.andWhere('tour.category ILIKE :category', { category: `%${query.category}%` });
    }

    if (query.start_date) {
      qb.andWhere('tour.start_date >= :start_date', { start_date: query.start_date });
    }

    if (query.search) {
      qb.andWhere(
        '(tour.name ILIKE :searchPattern OR :search = ANY(tour.tags))',
        { search: query.search, searchPattern: `%${query.search}%` },
      );
    }

    if (query.sort === 'start_date_asc') {
      qb.orderBy('tour.start_date', 'ASC', 'NULLS LAST');
    } else {
      qb.orderBy('tour.created_at', 'DESC');
    }

    return (await qb.getMany()).map((t) => this.withProxyUrls(t));
  }

  async findPublishedCategories(): Promise<{ name: string; icon_key: string | null; icon_svg: string | null; image_url: string | null }[]> {
    const [dbCategories, tourRows] = await Promise.all([
      this.categoryRepo.find({ order: { order: 'ASC', name: 'ASC' } }),
      this.tourRepo
        .createQueryBuilder('tour')
        .select('DISTINCT tour.category', 'category')
        .where('tour.status = :status', { status: 'published' })
        .andWhere('tour.category IS NOT NULL')
        .andWhere("tour.category != ''")
        .getRawMany<{ category: string }>(),
    ]);

    const result: { name: string; icon_key: string | null; icon_svg: string | null; image_url: string | null }[] = [];
    const seen = new Set<string>();

    // 1. DB'den gelen — admin panelinden tam yönetilir (ekle/sil/düzenle/görsel)
    for (const c of dbCategories) {
      if (!seen.has(c.name.toLowerCase())) {
        result.push({ name: c.name, icon_key: c.icon_key, icon_svg: c.icon_svg, image_url: c.image_url });
        seen.add(c.name.toLowerCase());
      }
    }

    // 2. Yayındaki turlardan gelen, DB'de olmayan — virgülle ayrılmış çoklu kategori
    //    alanları (ör. "Trekking, Dağcılık, Kamp") tek sahte kategori olarak
    //    sızmasın diye ayrıştırılıp tek tek eklenir.
    for (const r of tourRows) {
      const parts = r.category.split(',').map((p) => p.trim()).filter(Boolean);
      for (const name of parts) {
        if (!seen.has(name.toLowerCase())) {
          result.push({ name, icon_key: null, icon_svg: null, image_url: null });
          seen.add(name.toLowerCase());
        }
      }
    }

    return result;
  }

  async findOnePublished(idOrSlug: string): Promise<Tour & { booking_count: number }> {
    // Geriye-uyumlu: parametre UUID ise id ile, değilse slug ile aranır.
    // Böylece eski /tours/{uuid} linkleri de çalışmaya devam eder.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const tour = await this.tourRepo.findOne({
      where: isUuid
        ? { id: idOrSlug, status: 'published' }
        : { slug: idOrSlug, status: 'published' },
      relations: ['dates', 'agency'],
    });
    if (!tour) throw new NotFoundException('Tour not found');

    const id = tour.id;
    const [mobileCount, webCountRow] = await Promise.all([
      this.bookingRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.participant_count), 0)', 'total')
        .where('b.tour_id = :id', { id })
        .andWhere("b.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
      this.webBookingRepo
        .createQueryBuilder('wb')
        .select('COALESCE(SUM(wb.participant_count), 0)', 'total')
        .where('wb.tour_id = :id', { id })
        .andWhere("wb.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
    ]);

    const booking_count =
      parseInt(mobileCount?.total ?? '0', 10) +
      parseInt(webCountRow?.total ?? '0', 10);

    const result = this.withProxyUrls(tour) as Tour & { booking_count: number; agency_name: string | null };
    result.booking_count = booking_count;
    result.agency_name = (tour.agency as any)?.name ?? null;
    return result;
  }

  async createWebBooking(tourId: string, dto: CreateWebBookingDto): Promise<WebBooking> {
    const tour = await this.tourRepo.findOne({ where: { id: tourId, status: 'published' } });
    if (!tour) throw new NotFoundException('Tour not found');

    const [mobileCount, webCountRow] = await Promise.all([
      this.bookingRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.participant_count), 0)', 'total')
        .where('b.tour_id = :id', { id: tourId })
        .andWhere("b.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
      this.webBookingRepo
        .createQueryBuilder('wb')
        .select('COALESCE(SUM(wb.participant_count), 0)', 'total')
        .where('wb.tour_id = :id', { id: tourId })
        .andWhere("wb.status != 'cancelled'")
        .getRawOne<{ total: string }>(),
    ]);

    const booked =
      parseInt(mobileCount?.total ?? '0', 10) +
      parseInt(webCountRow?.total ?? '0', 10);
    const requested = dto.participant_count ?? 1;

    if (booked + requested > tour.max_participants) {
      throw new BadRequestException('Kontenjan yetersiz');
    }

    const booking = this.webBookingRepo.create({
      tour_id: tourId,
      full_name: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      participant_count: requested,
      notes: dto.notes ?? null,
    });

    return this.webBookingRepo.save(booking);
  }

  // ── Agency ───────────────────────────────────────────────────────────────

  async findAgencyTours(agencyId: string): Promise<Tour[]> {
    const tours = await this.tourRepo.find({
      where: { agency_id: agencyId },
      relations: ['dates'],
      order: { created_at: 'DESC' },
    });
    return tours.map((t) => this.withProxyUrls(t));
  }

  async findAgencyTour(agencyId: string, tourId: string): Promise<Tour> {
    const tour = await this.tourRepo.findOne({
      where: { id: tourId },
      relations: ['dates'],
    });
    if (!tour) throw new NotFoundException('Tour not found');
    if (tour.agency_id !== agencyId)
      throw new ForbiddenException('You do not own this tour');
    return this.withProxyUrls(tour);
  }

  // Ada göre benzersiz slug üretir. Aynı slug başka bir turda varsa "-2", "-3"
  // ekler. excludeId verilirse o turun kendi slug'ı çakışma sayılmaz (güncelleme).
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name);
    let candidate = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.tourRepo.findOne({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) break;
      candidate = `${base}-${n++}`;
    }
    return candidate;
  }

  async createTour(agencyId: string, dto: CreateTourDto): Promise<Tour> {
    const points = calculatePoints(
      dto.altitude_meters ?? 0,
      Number(dto.distance_km ?? 0),
      dto.difficulty,
    );

    const slug = await this.generateUniqueSlug(dto.name);

    const tour = this.tourRepo.create({
      agency_id: agencyId,
      name: dto.name,
      slug,
      description: dto.description ?? null,
      location_name: dto.location_name,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      altitude_meters: dto.altitude_meters ?? null,
      difficulty: dto.difficulty,
      distance_km: dto.distance_km ?? null,
      max_participants: dto.max_participants,
      photo_urls: dto.photo_urls ?? [],
      points,
      status: dto.status ?? 'draft',
      category: dto.category ?? null,
      price: dto.price ?? null,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      guide_name: dto.guide_name ?? null,
      guide_instagram: (dto as any).guide_instagram ?? null,
      tursab_no: dto.tursab_no ?? null,
      meeting_points: dto.meeting_points ?? null,
      target_location: dto.target_location ?? null,
      contact_phone: dto.contact_phone ?? null,
      accommodation: dto.accommodation ?? null,
      transportation: dto.transportation ?? null,
      program: dto.program ?? null,
      important_notes: dto.important_notes ?? null,
      tags: dto.tags ?? [],
      organizer: dto.organizer ?? null,
      accommodation_url: dto.accommodation_url ?? null,
      price_currency: dto.price_currency ?? 'TRY',
    });

    return this.tourRepo.save(tour);
  }

  async updateTour(
    agencyId: string,
    tourId: string,
    dto: UpdateTourDto,
  ): Promise<Tour> {
    const tour = await this.findOwnedTour(agencyId, tourId);

    // Recalculate points if relevant fields changed
    const altitude = dto.altitude_meters ?? tour.altitude_meters ?? 0;
    const distance = dto.distance_km ?? Number(tour.distance_km ?? 0);
    const difficulty = dto.difficulty ?? tour.difficulty;
    const points = calculatePoints(altitude, Number(distance), difficulty);

    // İsim değiştiyse slug'ı yenile; hiç slug yoksa üret. Aksi halde dokunma.
    let slug = tour.slug;
    if (dto.name && dto.name !== tour.name) {
      slug = await this.generateUniqueSlug(dto.name, tour.id);
    } else if (!slug) {
      slug = await this.generateUniqueSlug(tour.name, tour.id);
    }

    // Only assign fields explicitly sent in the request — undefined means "don't touch"
    const defined = Object.fromEntries(
      Object.entries(dto as Record<string, unknown>).filter(([, v]) => v !== undefined),
    );
    Object.assign(tour, { ...defined, points, slug });

    return this.tourRepo.save(tour);
  }

  async deleteTour(agencyId: string, tourId: string): Promise<void> {
    const tour = await this.findOwnedTour(agencyId, tourId);
    await this.tourRepo.remove(tour);
  }

  // ── Dates ─────────────────────────────────────────────────────────────────

  async addDate(
    agencyId: string,
    tourId: string,
    dto: CreateTourDateDto,
  ): Promise<TourDate> {
    await this.findOwnedTour(agencyId, tourId);

    const tourDate = this.tourDateRepo.create({
      tour_id: tourId,
      date: dto.date,
      available_slots: dto.available_slots,
    });

    return this.tourDateRepo.save(tourDate);
  }

  async removeDate(
    agencyId: string,
    tourId: string,
    dateId: string,
  ): Promise<void> {
    await this.findOwnedTour(agencyId, tourId);

    const tourDate = await this.tourDateRepo.findOne({
      where: { id: dateId, tour_id: tourId },
    });
    if (!tourDate) throw new NotFoundException('Tour date not found');

    await this.tourDateRepo.remove(tourDate);
  }

  // ── Bookings view ─────────────────────────────────────────────────────────

  async getTourBookings(agencyId: string, tourId: string): Promise<Booking[]> {
    await this.findOwnedTour(agencyId, tourId);

    return this.bookingRepo.find({
      where: { tour_id: tourId },
      relations: ['user', 'tour_date'],
      order: { created_at: 'DESC' },
    });
  }

  // ── Agency Booking Management ─────────────────────────────────────────────

  async getAllAgencyBookings(agencyId: string): Promise<Booking[]> {
    const tours = await this.tourRepo.find({
      where: { agency_id: agencyId },
      select: ['id'],
    });
    const tourIds = tours.map((t) => t.id);
    if (!tourIds.length) return [];

    return this.bookingRepo.find({
      where: { tour_id: In(tourIds) },
      relations: ['tour'],
      order: { created_at: 'DESC' },
    });
  }

  async updateAgencyBookingStatus(
    agencyId: string,
    bookingId: string,
    status: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['tour'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.tour.agency_id !== agencyId)
      throw new ForbiddenException('Not your booking');

    const prev = booking.status;
    (booking as any).status = status;
    await this.bookingRepo.save(booking);

    const guestName = `${booking.name} ${booking.surname}`.trim();
    const tourName = booking.tour.name;
    if (prev !== 'confirmed' && status === 'confirmed') {
      void this.emailService.sendBookingConfirmed(booking.email, guestName, tourName);
    } else if (prev !== 'cancelled' && status === 'cancelled') {
      void this.emailService.sendBookingCancelled(booking.email, guestName, tourName);
    }

    return booking;
  }

  async getAllAgencyWebBookings(agencyId: string): Promise<WebBooking[]> {
    return this.webBookingRepo
      .createQueryBuilder('wb')
      .leftJoinAndSelect('wb.tour', 'tour')
      .where('tour.agency_id = :agencyId', { agencyId })
      .orderBy('wb.created_at', 'DESC')
      .getMany();
  }

  async updateAgencyWebBookingStatus(
    agencyId: string,
    webBookingId: string,
    status: string,
  ): Promise<WebBooking> {
    const booking = await this.webBookingRepo.findOne({
      where: { id: webBookingId },
      relations: ['tour'],
    });
    if (!booking) throw new NotFoundException('Web booking not found');
    if (booking.tour.agency_id !== agencyId)
      throw new ForbiddenException('Not your booking');

    const prev = booking.status;
    (booking as any).status = status;
    await this.webBookingRepo.save(booking);

    const tourName = booking.tour.name;
    if (prev !== 'confirmed' && status === 'confirmed') {
      void this.emailService.sendBookingConfirmed(booking.email, booking.full_name, tourName);
    } else if (prev !== 'cancelled' && status === 'cancelled') {
      void this.emailService.sendBookingCancelled(booking.email, booking.full_name, tourName);
    }

    // Tour attended → award the tour's XP to the matching registered user (by email)
    if (prev !== 'completed' && status === 'completed') {
      await this.awardWebBookingPoints(booking);
    }

    return booking;
  }

  // Web bookings are guest records; if the guest email belongs to a registered
  // user, credit the tour points to that account when the tour is completed.
  private async awardWebBookingPoints(booking: WebBooking): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email: booking.email } });
    if (!user) return; // guest without an account — nothing to credit

    const pointsEarned = booking.tour.points ?? 0;
    if (pointsEarned <= 0) return;

    // Idempotency: skip if this tour already credited this user
    const existing = await this.dataSource.getRepository(UserPointsLog).findOne({
      where: { user_id: user.id, tour_id: booking.tour_id },
    });
    if (existing) return;

    await this.dataSource.transaction(async (manager) => {
      const log = manager.create(UserPointsLog, {
        user_id: user.id,
        tour_id: booking.tour_id,
        booking_id: null,
        points_earned: pointsEarned,
      });
      await manager.save(log);

      await manager.query(
        `UPDATE users SET total_points = total_points + $1 WHERE id = $2`,
        [pointsEarned, user.id],
      );
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private toProxyUrl(url: string): string {
    const apiBase = this.configService.get<string>('API_BASE_URL') ?? '';
    const bucket = this.mediaService.getBucketName();
    const gcsPrefix = `https://storage.googleapis.com/${bucket}/`;

    if (url.startsWith(gcsPrefix)) {
      const filename = url.slice(gcsPrefix.length);
      return `${apiBase}/media/${filename}`;
    }

    // Handle already-proxied relative URLs stored in DB (e.g. '/media/uuid.png')
    if (url.startsWith('/media/')) {
      return `${apiBase}${url}`;
    }

    return url;
  }

  private withProxyUrls(tour: Tour): Tour {
    tour.photo_urls = (tour.photo_urls ?? []).map((u) => this.toProxyUrl(u));
    return tour;
  }

  async findManyByIds(ids: string[]): Promise<Tour[]> {
    if (ids.length === 0) return [];
    const tours = await this.tourRepo
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.dates', 'dates')
      .where('tour.id IN (:...ids)', { ids })
      .getMany();
    return tours.map((t) => this.withProxyUrls(t));
  }

  private async findOwnedTour(agencyId: string, tourId: string): Promise<Tour> {
    const tour = await this.tourRepo.findOne({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour not found');
    if (tour.agency_id !== agencyId)
      throw new ForbiddenException('You do not own this tour');
    return tour;
  }
}
