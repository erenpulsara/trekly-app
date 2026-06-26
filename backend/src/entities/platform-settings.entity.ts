import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
  @PrimaryColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', default: 'Trekly' })
  site_name!: string;

  @Column({ type: 'varchar', default: 'destek@trekly.com' })
  support_email!: string;

  @Column({ type: 'boolean', default: false })
  maintenance_mode!: boolean;

  @Column({ type: 'boolean', default: true })
  new_registrations!: boolean;

  @Column({ type: 'boolean', default: true })
  email_verification!: boolean;

  @Column({ type: 'boolean', default: false })
  auto_approve_agencies!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  commission_rate!: string;

  @Column({ type: 'int', default: 24 })
  min_booking_hours!: number;
}
