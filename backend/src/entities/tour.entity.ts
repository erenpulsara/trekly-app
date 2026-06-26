import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Agency } from './agency.entity';
import { TourDate } from './tour-date.entity';
import { Booking } from './booking.entity';

export type TourDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type TourStatus = 'draft' | 'published' | 'rejected';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  agency_id!: string;

  @ManyToOne(() => Agency, (agency) => agency.tours)
  @JoinColumn({ name: 'agency_id' })
  agency!: Agency;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: false })
  location_name!: string;

  @Column({ type: 'decimal', nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', nullable: true })
  longitude!: number | null;

  @Column({ type: 'integer', nullable: false })
  altitude_meters!: number;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard', 'extreme'],
    nullable: false,
  })
  difficulty!: TourDifficulty;

  @Column({ type: 'decimal', nullable: false })
  distance_km!: number;

  @Column({ type: 'integer', nullable: false })
  max_participants!: number;

  @Column({ type: 'text', array: true, default: '{}' })
  photo_urls!: string[];

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'rejected'],
    default: 'draft',
  })
  status!: TourStatus;

  @Column({ type: 'text', nullable: true })
  admin_note!: string | null;

  @Column({ type: 'integer', nullable: false })
  points!: number;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ type: 'decimal', nullable: true })
  price!: number | null;

  @Column({ type: 'date', nullable: true })
  start_date!: string | null;

  @Column({ type: 'date', nullable: true })
  end_date!: string | null;

  @Column({ type: 'varchar', nullable: true })
  guide_name!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tursab_no!: string | null;

  @Column({ type: 'text', nullable: true })
  meeting_points!: string | null;

  @Column({ type: 'varchar', nullable: true })
  target_location!: string | null;

  @Column({ type: 'varchar', nullable: true })
  contact_phone!: string | null;

  @Column({ type: 'text', nullable: true })
  accommodation!: string | null;

  @Column({ type: 'text', nullable: true })
  transportation!: string | null;

  @Column({ type: 'text', nullable: true })
  program!: string | null;

  @Column({ type: 'text', nullable: true })
  important_notes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => TourDate, (tourDate) => tourDate.tour)
  dates!: TourDate[];

  @OneToMany(() => Booking, (booking) => booking.tour)
  bookings!: Booking[];
}
