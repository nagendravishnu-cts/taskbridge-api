import 'reflect-metadata';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
@Index(['organisationId', 'userId'])
@Index('IDX_TRANSACTIONS_ORGANISATION_CREATED_AT', ['organisationId', 'createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  @Index('IDX_TRANSACTIONS_ORGANISATION_ID')
  organisationId!: string;

  @Column('uuid')
  @Index('IDX_TRANSACTIONS_USER_ID')
  userId!: string;

  @Column('varchar', { length: 50 })
  type!: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status!: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Column('text')
  description!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('timestamptz', { nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
