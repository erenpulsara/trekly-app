import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_dates')
export class TourDate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour, (tour) => tour.dates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  // Aralığın başlangıcı. Tek günlük bir tarih için end_date null bırakılır.
  @Column({ type: 'date', nullable: false })
  date!: string;

  // Aralığın bitişi — opsiyonel. Null ise bu kayıt tek günlük bir tarihi temsil eder
  // (geriye dönük uyumluluk: mevcut tüm kayıtlar bu şekilde).
  @Column({ type: 'date', nullable: true })
  end_date!: string | null;

  @Column({ type: 'integer', nullable: false })
  available_slots!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
