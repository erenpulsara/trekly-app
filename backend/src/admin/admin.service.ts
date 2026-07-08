import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';
import { Booking } from '../entities/booking.entity';
import { BlogPost } from '../entities/blog-post.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { AuditLog, AuditLogLevel } from '../entities/audit-log.entity';
import { PlatformSettings } from '../entities/platform-settings.entity';
import { calculatePoints } from '../common/points.calculator';
import { slugify } from '../common/slugify';

const DEFAULT_CATEGORIES = [
  'trekking', 'dağcılık', 'bisiklet', 'kamp', 'dalış',
  'zirve tırmanışı', 'kaya tırmanışı', 'yelken',
  'aile kampı', 'dağcılık eğitimi', 'kayak', 'su sporları',
];

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
    @InjectRepository(Tour)
    private tourRepo: Repository<Tour>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(BlogPost)
    private blogRepo: Repository<BlogPost>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(PlatformSettings)
    private settingsRepo: Repository<PlatformSettings>,
  ) {}

  // Seeds the previously hard-coded static categories into the DB so they
  // become fully manageable (edit/delete/image) from the admin panel.
  // Idempotent — only inserts names that don't already exist.
  async onModuleInit() {
    try {
      const existing = await this.categoryRepo.find();
      const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
      const missing = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));
      if (missing.length > 0) {
        await this.categoryRepo.save(
          missing.map((name) => this.categoryRepo.create({ name, is_static: false })),
        );
        this.logger.log(`Seeded ${missing.length} default categories`);
      }
    } catch (err) {
      this.logger.warn(`Category seed skipped: ${err}`);
    }

    // Her başlatmada tur XP puanlarını güncel formülle senkronla. Idempotent:
    // yalnızca puanı değişen turları kaydeder, doğru olanlara dokunmaz. Böylece
    // deploy sonrası mevcut turların puanı elle tetikleme olmadan otomatik dolar.
    try {
      const result = await this.recalculateAllTourPoints();
      if (result.updated > 0) {
        this.logger.log(`Recalculated tour points: ${result.updated}/${result.total} updated`);
      }
    } catch (err) {
      this.logger.warn(`Tour points recalculation skipped: ${err}`);
    }

    // Slug'ı olmayan (puan sistemi öncesi / eski) turlara ada göre benzersiz slug
    // üret. Idempotent — slug'ı olan turlara dokunmaz. try/catch ile sarıldığı için
    // bir hata olsa bile uygulamanın açılmasını engellemez.
    try {
      const all = await this.tourRepo.find();
      const used = new Set(all.map((t) => t.slug).filter(Boolean) as string[]);
      let slugified = 0;
      for (const t of all) {
        if (t.slug) continue;
        const base = slugify(t.name);
        let candidate = base;
        let n = 2;
        while (used.has(candidate)) candidate = `${base}-${n++}`;
        t.slug = candidate;
        used.add(candidate);
        await this.tourRepo.save(t);
        slugified++;
      }
      if (slugified > 0) {
        this.logger.log(`Backfilled ${slugified} tour slugs`);
      }
    } catch (err) {
      this.logger.warn(`Tour slug backfill skipped: ${err}`);
    }
  }

  private async log(level: AuditLogLevel, action: string, detail: string | null, user: string | null) {
    try {
      const entry = this.auditLogRepo.create({ level, action, detail, user });
      await this.auditLogRepo.save(entry);
    } catch { /* don't let logging failures block operations */ }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [agencies, tours, bookings, blogPosts] = await Promise.all([
      this.agencyRepo.count(),
      this.tourRepo.count(),
      this.bookingRepo.count(),
      this.blogRepo.count(),
    ]);
    const pendingBookings = await this.bookingRepo.count({ where: { status: 'pending' } });
    return { agencies, tours, bookings, blogPosts, pendingBookings };
  }

  // ── Agencies ──────────────────────────────────────────────────────────────

  async getAllAgencies() {
    const agencies = await this.agencyRepo.find({
      relations: ['tours'],
      order: { created_at: 'DESC' },
    });
    return agencies.map(({ password_hash: _ph, ...a }) => ({
      ...a,
      tour_count: a.tours?.length ?? 0,
      tours: undefined,
    }));
  }

  async verifyAgency(id: string) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) throw new NotFoundException('Acenta bulunamadı');
    agency.email_verified = true;
    agency.verified_at = new Date();
    await this.agencyRepo.save(agency);
    await this.log('success', 'Acenta Onaylandı', `${agency.name} (${agency.email}) onaylandı`, 'admin');
    return { message: 'Acenta onaylandı' };
  }

  async suspendAgency(id: string, suspend: boolean) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) throw new NotFoundException('Acenta bulunamadı');
    agency.is_suspended = suspend;
    await this.agencyRepo.save(agency);
    await this.log(
      suspend ? 'warning' : 'info',
      suspend ? 'Acenta Askıya Alındı' : 'Acenta Askısı Kaldırıldı',
      `${agency.name} (${agency.email})`,
      'admin',
    );
    return { message: suspend ? 'Acenta askıya alındı' : 'Askı kaldırıldı' };
  }

  async deleteAgency(id: string) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) throw new NotFoundException('Acenta bulunamadı');
    await this.agencyRepo.remove(agency);
    await this.log('warning', 'Acenta Silindi', `${agency.name} (${agency.email}) silindi`, 'admin');
    return { message: 'Acenta silindi' };
  }

  // ── Tours ─────────────────────────────────────────────────────────────────

  async getAllTours() {
    return this.tourRepo.find({
      relations: ['agency'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        location_name: true,
        status: true,
        difficulty: true,
        price: true,
        category: true,
        admin_note: true,
        created_at: true,
        agency: { id: true, name: true, email: true },
      },
    });
  }

  async updateTourStatus(id: string, status: 'draft' | 'published' | 'rejected', admin_note?: string) {
    const tour = await this.tourRepo.findOne({ where: { id } });
    if (!tour) throw new NotFoundException('Tur bulunamadı');
    tour.status = status;
    tour.admin_note = admin_note ?? null;
    await this.tourRepo.save(tour);

    const actionMap = { published: 'Tur Yayına Alındı', draft: 'Tur Yayından Kaldırıldı', rejected: 'Tur Geri Gönderildi' };
    const levelMap: Record<string, any> = { published: 'success', draft: 'info', rejected: 'warning' };
    await this.log(levelMap[status], actionMap[status], `"${tour.name}" — ${admin_note ?? ''}`, 'admin');
    return { message: 'Tur güncellendi', status, admin_note: tour.admin_note };
  }

  async deleteTour(id: string) {
    const tour = await this.tourRepo.findOne({ where: { id } });
    if (!tour) throw new NotFoundException('Tur bulunamadı');
    await this.tourRepo.remove(tour);
    await this.log('warning', 'Tur Silindi', `"${tour.name}" turu silindi`, 'admin');
    return { message: 'Tur silindi' };
  }

  // Tüm turların XP puanını güncel formüle göre yeniden hesaplar.
  // Puan sistemi öncesi oluşturulan ya da 0 puanla kalmış turları düzeltmek için
  // bir kez çalıştırılır (admin panelinden tetiklenir). Kazanılmış puanları etkilemez —
  // sadece turların gösterilen/kazanılacak XP değerini günceller.
  async recalculateAllTourPoints() {
    const tours = await this.tourRepo.find();
    let updated = 0;
    for (const tour of tours) {
      const newPoints = calculatePoints(
        tour.altitude_meters ?? 0,
        Number(tour.distance_km ?? 0),
        tour.difficulty,
      );
      if (tour.points !== newPoints) {
        tour.points = newPoints;
        await this.tourRepo.save(tour);
        updated++;
      }
    }
    await this.log('info', 'Tur Puanları Güncellendi', `${updated}/${tours.length} tur yeniden hesaplandı`, 'admin');
    return { message: 'Tur puanları yeniden hesaplandı', total: tours.length, updated };
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  async getAllBookings() {
    const bookings = await this.bookingRepo.find({
      relations: ['tour', 'tour.agency', 'tour_date'],
      order: { created_at: 'DESC' },
    });
    return bookings.map((b) => ({
      id: b.id,
      name: b.name,
      surname: b.surname,
      email: b.email,
      phone: b.phone,
      participant_count: b.participant_count,
      notes: b.notes,
      status: b.status,
      created_at: b.created_at,
      tour: b.tour ? { id: b.tour.id, name: b.tour.name } : null,
      agency: b.tour?.agency ? { id: b.tour.agency.id, name: b.tour.agency.name } : null,
      tour_date: b.tour_date ? { id: b.tour_date.id, date: b.tour_date.date } : null,
    }));
  }

  // ── Blog ──────────────────────────────────────────────────────────────────

  async getAllBlogPosts() {
    return this.blogRepo.find({ order: { created_at: 'DESC' } });
  }

  async createBlogPost(dto: {
    title: string; slug: string; content: string;
    excerpt?: string; cover_image?: string; status?: 'draft' | 'published';
  }) {
    const post = this.blogRepo.create({
      ...dto,
      status: dto.status ?? 'draft',
      published_at: dto.status === 'published' ? new Date() : null,
    });
    const saved = await this.blogRepo.save(post);
    await this.log('info', 'Blog Yazısı Oluşturuldu', `"${dto.title}" ${dto.status === 'published' ? 'yayınlandı' : 'taslak olarak kaydedildi'}`, 'admin');
    return saved;
  }

  async updateBlogPost(id: string, dto: Partial<{
    title: string; slug: string; content: string;
    excerpt: string; cover_image: string; status: 'draft' | 'published';
  }>) {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');
    if (dto.status === 'published' && post.status !== 'published') {
      (dto as any).published_at = new Date();
      await this.log('success', 'Blog Yazısı Yayınlandı', `"${post.title}" yayına alındı`, 'admin');
    }
    Object.assign(post, dto);
    return this.blogRepo.save(post);
  }

  async deleteBlogPost(id: string) {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');
    await this.blogRepo.remove(post);
    await this.log('warning', 'Blog Yazısı Silindi', `"${post.title}" silindi`, 'admin');
    return { message: 'Blog yazısı silindi' };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getAllUsers() {
    const users = await this.userRepo.find({ order: { created_at: 'DESC' } });
    return users.map(({ password_hash: _ph, password_reset_token: _t, password_reset_expires: _e, ...u }) => u);
  }

  async banUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    user.is_banned = true;
    await this.userRepo.save(user);
    await this.log('warning', 'Kullanıcı Banlandı', `${user.email} hesabı banlı olarak işaretlendi`, 'admin');
    return { message: 'Kullanıcı banlandı' };
  }

  async activateUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    user.is_banned = false;
    await this.userRepo.save(user);
    await this.log('success', 'Kullanıcı Aktifleştirildi', `${user.email} hesabı aktifleştirildi`, 'admin');
    return { message: 'Kullanıcı aktifleştirildi' };
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async getReports() {
    const [totalBookings, totalUsers, totalAgencies, totalTours] = await Promise.all([
      this.bookingRepo.count(),
      this.userRepo.count(),
      this.agencyRepo.count(),
      this.tourRepo.count(),
    ]);

    const topTours = await this.tourRepo
      .createQueryBuilder('tour')
      .leftJoin('tour.bookings', 'booking')
      .select('tour.id', 'id')
      .addSelect('tour.name', 'name')
      .addSelect('COUNT(booking.id)', 'bookings')
      .groupBy('tour.id')
      .orderBy('bookings', 'DESC')
      .limit(5)
      .getRawMany();

    const topAgencies = await this.agencyRepo
      .createQueryBuilder('agency')
      .leftJoin('agency.tours', 'tour')
      .select('agency.id', 'id')
      .addSelect('agency.name', 'name')
      .addSelect('COUNT(tour.id)', 'tours')
      .groupBy('agency.id')
      .orderBy('tours', 'DESC')
      .limit(5)
      .getRawMany();

    const monthlyRaw = await this.bookingRepo
      .createQueryBuilder('booking')
      .select("TO_CHAR(DATE_TRUNC('month', booking.created_at), 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where("booking.created_at >= NOW() - INTERVAL '12 months'")
      .groupBy("DATE_TRUNC('month', booking.created_at)")
      .orderBy("DATE_TRUNC('month', booking.created_at)", 'ASC')
      .getRawMany();

    const monthlyBookings = monthlyRaw.map((r) => ({
      month: r.month as string,
      count: Number(r.count),
    }));

    return { totalBookings, totalUsers, totalAgencies, totalTours, topTours, topAgencies, monthlyBookings };
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────

  async getAuditLogs() {
    return this.auditLogRepo.find({
      order: { created_at: 'DESC' },
      take: 200,
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSettings() {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({
        id: 1,
        site_name: 'Trekly',
        support_email: 'destek@trekly.com',
        maintenance_mode: false,
        new_registrations: true,
        email_verification: true,
        auto_approve_agencies: false,
        commission_rate: '10.00',
        min_booking_hours: 24,
      });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: Partial<Omit<PlatformSettings, 'id'>>) {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1, ...dto } as PlatformSettings);
    } else {
      Object.assign(settings, dto);
    }
    const saved = await this.settingsRepo.save(settings);
    await this.log('info', 'Platform Ayarları Güncellendi', 'Genel platform yapılandırması değiştirildi', 'admin');
    return saved;
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async getAllCategories() {
    return this.categoryRepo.find({ order: { order: 'ASC', created_at: 'ASC' } });
  }

  async createCategory(dto: { name: string; icon_key?: string; icon_svg?: string; order?: number; image_url?: string }) {
    const cat = this.categoryRepo.create({
      name: dto.name,
      icon_key: dto.icon_key ?? null,
      icon_svg: dto.icon_svg ?? null,
      image_url: dto.image_url ?? null,
      order: dto.order ?? 0,
      is_static: false,
    });
    return this.categoryRepo.save(cat);
  }

  async updateCategory(id: string, dto: { icon_key?: string; icon_svg?: string; order?: number; name?: string; image_url?: string }) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori bulunamadı');
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async deleteCategory(id: string) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori bulunamadı');
    await this.categoryRepo.remove(cat);
    return { message: 'Kategori silindi' };
  }
}
