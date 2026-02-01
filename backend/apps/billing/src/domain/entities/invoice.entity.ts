import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  VOID = 'VOID',
  PAST_DUE = 'PAST_DUE'
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  amount: number;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  totalAmount: number;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  paidDate: Date;

  // Storing the breakdown JSON allows us to see "API Calls: $50" later
  @Column({ type: 'jsonb', nullable: true })
  items: any; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
