import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  icon_key!: string | null;

  @Column({ type: 'text', nullable: true })
  icon_svg!: string | null;

  @Column({ type: 'integer', default: 0 })
  order!: number;

  @Column({ type: 'boolean', default: false })
  is_static!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
