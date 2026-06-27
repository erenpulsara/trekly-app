import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

export type WebBookingStatus = 'pending' | 'confirmed' | 'cancelled';

@Entity('web_bookings')
export class WebBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @Column({ type: 'varchar' })
  full_name!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'integer', default: 1 })
  participant_count!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status!: WebBookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
