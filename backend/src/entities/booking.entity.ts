import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';
import { TourDate } from './tour-date.entity';
import { User } from './user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour, (tour) => tour.bookings)
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'uuid' })
  tour_date_id!: string;

  @ManyToOne(() => TourDate)
  @JoinColumn({ name: 'tour_date_id' })
  tour_date!: TourDate;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  surname!: string;

  @Column({ type: 'varchar', nullable: false })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  phone!: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  participant_count!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status!: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
