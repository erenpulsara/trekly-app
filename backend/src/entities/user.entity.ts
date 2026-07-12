import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './booking.entity';
import { UserPointsLog } from './user-points-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  surname!: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password_hash!: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  google_id!: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  apple_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'integer', default: 0 })
  total_points!: number;

  @Column({ type: 'boolean', default: false })
  is_banned!: boolean;

  @Column({ type: 'varchar', nullable: true })
  password_reset_token!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  password_reset_expires!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Booking[];

  @OneToMany(() => UserPointsLog, (log) => log.user)
  points_logs!: UserPointsLog[];
}
