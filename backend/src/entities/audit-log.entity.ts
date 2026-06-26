import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type AuditLogLevel = 'info' | 'success' | 'warning' | 'error';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', default: 'info' })
  level!: AuditLogLevel;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'text', nullable: true })
  detail!: string | null;

  @Column({ type: 'varchar', nullable: true })
  user!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
