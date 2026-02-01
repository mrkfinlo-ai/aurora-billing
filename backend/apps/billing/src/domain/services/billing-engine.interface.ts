import { Subscription } from '../entities/subscription.entity';
import { Usage } from '../entities/usage.entity';

export interface CalculatedCharges {
  amount: number;
  currency: string;
  breakdown: Record<string, number>;
}

export interface BillingEngine {
  calculateCharges(subscription: Subscription, usage: Usage[]): Promise<CalculatedCharges>;
}
