import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Usage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subscriptionId: string;

  @Column()
  unitType: string; // e.g., 'API_CALLS', 'STORAGE_GB'

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  recordedAt: Date;
}
