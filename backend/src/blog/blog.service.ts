import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
  ) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let i = 1;
    while (await this.blogRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const post = this.blogRepo.create({
      ...dto,
      slug,
      status: dto.status ?? 'draft',
      published_at: dto.status === 'published' ? new Date() : null,
    });
    return this.blogRepo.save(post);
  }

  findAllPublished(): Promise<BlogPost[]> {
    return this.blogRepo.find({
      where: { status: 'published' },
      order: { published_at: 'DESC' },
    });
  }

  findAll(): Promise<BlogPost[]> {
    return this.blogRepo.find({ order: { created_at: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({ where: { slug, status: 'published' } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.findOne(id);
    if (dto.status === 'published' && post.status !== 'published') {
      post.published_at = new Date();
    }
    Object.assign(post, dto);
    return this.blogRepo.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.blogRepo.remove(post);
  }
}
