import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string; // Links to Identity Service

  @Column()
  planId: string; // Links to Product Service

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  basePrice: number; // Stored as decimal for financial accuracy

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, CANCELED, PAST_DUE

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
