import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentState {
  INITIATED = 'INITIATED',
  VALIDATING = 'VALIDATING',
  FRAUD_CHECK = 'FRAUD_CHECK',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED'
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string; // Links to the Invoice being paid

  @Column()
  customerId: string;

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentState,
    default: PaymentState.INITIATED
  })
  status: PaymentState;

  @Column({ nullable: true })
  transactionId: string; // ID from Stripe/PayPal

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
