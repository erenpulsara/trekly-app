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

  @Column({ type: 'date', nullable: false })
  date!: string;

  @Column({ type: 'integer', nullable: false })
  available_slots!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
