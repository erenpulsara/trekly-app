import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from '../entities/tour.entity';
import { TourDate } from '../entities/tour-date.entity';
import { Booking } from '../entities/booking.entity';
import { Category } from '../entities/category.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDateDto } from './dto/create-tour-date.dto';
import { TourQueryDto } from './dto/tour-query.dto';
import { calculatePoints } from '../common/points.calculator';
import { MediaService } from '../media/media.service';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private tourRepo: Repository<Tour>,
    @InjectRepository(TourDate)
    private tourDateRepo: Repository<TourDate>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
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
      qb.andWhere('tour.category = :category', { category: query.category });
    }

    if (query.start_date) {
      qb.andWhere('tour.start_date >= :start_date', { start_date: query.start_date });
    }

    return (await qb.getMany()).map((t) => this.withProxyUrls(t));
  }

  async findPublishedCategories(): Promise<{ name: string; icon_key: string | null }[]> {
    const STATIC_8 = [
      'trekking', 'dağcılık', 'kano', 'rafting',
      'bisiklet', 'kamp', 'dalış', 'yamaç paraşütü',
    ];

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

    const result: { name: string; icon_key: string | null }[] = [];
    const seen = new Set<string>();

    // 1. Static 8 — her zaman önce gelir
    for (const key of STATIC_8) {
      const dbMatch = dbCategories.find((c) => c.name.toLowerCase() === key);
      result.push({ name: key, icon_key: dbMatch?.icon_key ?? null });
      seen.add(key);
    }

    // 2. DB'den gelen (admin-ekledi), statik 8'de olmayan
    for (const c of dbCategories) {
      if (!seen.has(c.name.toLowerCase())) {
        result.push({ name: c.name, icon_key: c.icon_key });
        seen.add(c.name.toLowerCase());
      }
    }

    // 3. Yayındaki turlardan gelen, yukarıda olmayan
    for (const r of tourRows) {
      if (!seen.has(r.category.toLowerCase())) {
        result.push({ name: r.category, icon_key: null });
        seen.add(r.category.toLowerCase());
      }
    }

    return result;
  }

  async findOnePublished(id: string): Promise<Tour> {
    const tour = await this.tourRepo.findOne({
      where: { id, status: 'published' },
      relations: ['dates'],
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return this.withProxyUrls(tour);
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

  async createTour(agencyId: string, dto: CreateTourDto): Promise<Tour> {
    const points = calculatePoints(
      dto.altitude_meters,
      Number(dto.distance_km),
      dto.difficulty,
    );

    const tour = this.tourRepo.create({
      agency_id: agencyId,
      name: dto.name,
      description: dto.description ?? null,
      location_name: dto.location_name,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      altitude_meters: dto.altitude_meters,
      difficulty: dto.difficulty,
      distance_km: dto.distance_km,
      max_participants: dto.max_participants,
      photo_urls: dto.photo_urls ?? [],
      points,
      status: dto.status ?? 'draft',
      category: dto.category ?? null,
      price: dto.price ?? null,
      start_date: dto.start_date ?? null,
      end_date: dto.end_date ?? null,
      guide_name: dto.guide_name ?? null,
      tursab_no: dto.tursab_no ?? null,
      meeting_points: dto.meeting_points ?? null,
      target_location: dto.target_location ?? null,
      contact_phone: dto.contact_phone ?? null,
      accommodation: dto.accommodation ?? null,
      transportation: dto.transportation ?? null,
      program: dto.program ?? null,
      important_notes: dto.important_notes ?? null,
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
    const altitude = dto.altitude_meters ?? tour.altitude_meters;
    const distance = dto.distance_km ?? Number(tour.distance_km);
    const difficulty = dto.difficulty ?? tour.difficulty;
    const points = calculatePoints(altitude, Number(distance), difficulty);

    Object.assign(tour, {
      ...dto,
      points,
    });

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

  private async findOwnedTour(agencyId: string, tourId: string): Promise<Tour> {
    const tour = await this.tourRepo.findOne({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour not found');
    if (tour.agency_id !== agencyId)
      throw new ForbiddenException('You do not own this tour');
    return tour;
  }
}
