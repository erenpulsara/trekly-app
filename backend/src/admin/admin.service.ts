import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';
import { Booking } from '../entities/booking.entity';
import { BlogPost } from '../entities/blog-post.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class AdminService {
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
  ) {}

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

  async deleteAgency(id: string) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) throw new NotFoundException('Acenta bulunamadı');
    await this.agencyRepo.remove(agency);
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
        created_at: true,
        agency: { id: true, name: true, email: true },
      },
    });
  }

  async deleteTour(id: string) {
    const tour = await this.tourRepo.findOne({ where: { id } });
    if (!tour) throw new NotFoundException('Tur bulunamadı');
    await this.tourRepo.remove(tour);
    return { message: 'Tur silindi' };
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  async getAllBookings() {
    return this.bookingRepo.find({
      relations: ['tour', 'user'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        participant_count: true,
        status: true,
        created_at: true,
        tour: { id: true, name: true, location_name: true },
        user: { id: true, name: true, email: true },
      },
    });
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
    return this.blogRepo.save(post);
  }

  async updateBlogPost(id: string, dto: Partial<{
    title: string; slug: string; content: string;
    excerpt: string; cover_image: string; status: 'draft' | 'published';
  }>) {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');
    if (dto.status === 'published' && post.status !== 'published') {
      (dto as any).published_at = new Date();
    }
    Object.assign(post, dto);
    return this.blogRepo.save(post);
  }

  async deleteBlogPost(id: string) {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');
    await this.blogRepo.remove(post);
    return { message: 'Blog yazısı silindi' };
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async getAllCategories() {
    return this.categoryRepo.find({ order: { order: 'ASC', created_at: 'ASC' } });
  }

  async createCategory(dto: { name: string; icon_key?: string; order?: number }) {
    const cat = this.categoryRepo.create({
      name: dto.name,
      icon_key: dto.icon_key ?? null,
      order: dto.order ?? 0,
      is_static: false,
    });
    return this.categoryRepo.save(cat);
  }

  async updateCategory(id: string, dto: { icon_key?: string; order?: number; name?: string }) {
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
