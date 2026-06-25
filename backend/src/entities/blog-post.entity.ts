import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type BlogStatus = 'draft' | 'published';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'varchar', nullable: true })
  cover_image: string | null;

  @Column({ type: 'varchar', default: 'draft' })
  status: BlogStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
