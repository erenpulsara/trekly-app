import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';
import { Booking } from './booking.entity';

@Entity('user_points_log')
export class UserPointsLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.points_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'uuid' })
  booking_id!: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ type: 'integer', nullable: false })
  points_earned!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'awarded_at' })
  awarded_at!: Date;
}
