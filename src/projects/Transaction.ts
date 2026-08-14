import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Transaction entity representing a financial or operational transaction
 * within a specific organization. Transactions are immutable after creation
 * and support multi-tenant isolation through organisation ID.
 * 
 * AI-generated, unreviewed
 */
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Organisation ID - ensures multi-tenant data isolation.
   * All transactions must belong to exactly one organisation.
   */
  @Column('uuid')
  organisationId!: string;

  /**
   * User ID who initiated the transaction
   */
  @Column('uuid')
  userId!: string;

  /**
   * Transaction type (e.g., 'payment', 'refund', 'adjustment')
   */
  @Column('varchar', { length: 50 })
  type!: string;

  /**
   * Transaction amount in the smallest currency unit (e.g., cents)
   */
  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  /**
   * Currency code (ISO 4217 format, e.g., 'USD', 'EUR')
   */
  @Column('varchar', { length: 3 })
  currency!: string;

  /**
   * Current status of the transaction
   * Valid values: 'pending', 'completed', 'failed', 'cancelled'
   */
  @Column('varchar', { length: 20 })
  status!: 'pending' | 'completed' | 'failed' | 'cancelled';

  /**
   * Detailed description of the transaction
   */
  @Column('text')
  description!: string;

  /**
   * Metadata for transaction details (stored as JSONB for flexibility)
   * Should not contain sensitive information
   */
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  /**
   * Timestamp when the transaction was created
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Timestamp when the transaction was last updated
   * Note: Transactions should be immutable after creation, updates are minimal
   */
  @UpdateDateColumn()
  updatedAt!: Date;
}
