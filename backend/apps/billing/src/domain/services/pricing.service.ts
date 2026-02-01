import { Injectable } from '@nestjs/common';
import { BillingEngine, CalculatedCharges } from './billing-engine.interface';
import { Subscription } from '../entities/subscription.entity';
import { Usage } from '../entities/usage.entity';

@Injectable()
export class PricingService implements BillingEngine {

  async calculateCharges(subscription: Subscription, usage: Usage[]): Promise<CalculatedCharges> {
    // 1. Start with the base subscription price
    let total = Number(subscription.basePrice);
    const breakdown: Record<string, number> = {
      base_fee: total,
    };

    // 2. Calculate usage costs
    // In a real production system, you would fetch unit prices from a database or config.
    // Here, we define a standard rate for demonstration.
    const UNIT_PRICE = 0.05; // $0.05 per unit

    for (const record of usage) {
      const usageCost = record.quantity * UNIT_PRICE;
      total += usageCost;

      // Track breakdown for the invoice
      const key = `usage_${record.unitType}`;
      breakdown[key] = (breakdown[key] || 0) + usageCost;
    }

    return {
      amount: total,
      currency: 'USD',
      breakdown,
    };
  }
}
