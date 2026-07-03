import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Tour } from './tour.entity';

@Entity('favorites')
@Unique(['user_id', 'tour_id'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  tour_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Tour, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour!: Tour;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
