import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentState } from '../entities/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async processPayment(customerId: string, amount: number, invoiceId: string): Promise<Payment> {
    // STEP 1: Initialize
    const payment = this.paymentRepo.create({
      customerId,
      amount,
      invoiceId,
      status: PaymentState.INITIATED,
    });
    await this.paymentRepo.save(payment);
    this.logger.log(`Payment ${payment.id} INITIATED`);

    try {
      // STEP 2: Fraud Check (Simulated)
      await this.transitionState(payment, PaymentState.FRAUD_CHECK);
      // In a real app, you would call an external anti-fraud API here
      const isFraud = amount > 5000; // Simple rule: > $5000 is suspicious

      if (isFraud) {
        throw new Error('Fraud check failed: Amount too high');
      }

      // STEP 3: Processing (Talking to Gateway)
      await this.transitionState(payment, PaymentState.PROCESSING);
      // Simulate 1 second delay for Stripe/PayPal
      await new Promise(resolve => setTimeout(resolve, 1000));

      // STEP 4: Completion
      payment.transactionId = `tx_${Math.random().toString(36).substring(7)}`;
      await this.transitionState(payment, PaymentState.COMPLETED);

      return payment;

    } catch (error) {
      // COMPENSATING TRANSACTION: Mark as Failed
      this.logger.error(`Payment failed: ${error.message}`);
      payment.failureReason = error.message;
      await this.transitionState(payment, PaymentState.FAILED);
      return payment;
    }
  }

  private async transitionState(payment: Payment, newState: PaymentState) {
    payment.status = newState;
    await this.paymentRepo.save(payment);
    this.logger.log(`Payment ${payment.id} -> ${newState}`);
  }
}
