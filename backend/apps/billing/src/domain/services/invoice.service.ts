import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { PricingService } from './pricing.service';
import { Subscription } from '../entities/subscription.entity';
import { Usage } from '../entities/usage.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    private pricingService: PricingService,
    // INJECT KAFKA CLIENT
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async generateInvoice(subscription: Subscription, usage: Usage[]): Promise<Invoice> {
    // 1. Calculate
    const charges = await this.pricingService.calculateCharges(subscription, usage);

    // 2. Tax (10%)
    const taxRate = 0.10;
    const taxAmount = charges.amount * taxRate;
    const totalAmount = charges.amount + taxAmount;

    // 3. Due Date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // 4. Create Record
    const invoice = this.invoiceRepo.create({
      customerId: subscription.customerId,
      subscriptionId: subscription.id,
      status: InvoiceStatus.ISSUED,
      amount: charges.amount,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      dueDate: dueDate,
      items: charges.breakdown,
    });

    const savedInvoice = await this.invoiceRepo.save(invoice);

    // 5. EMIT DOMAIN EVENT (The "Aurora" Way)
    this.kafkaClient.emit('invoice_created', {
      eventId: crypto.randomUUID(), // Unique Event ID
      invoiceId: savedInvoice.id,
      customerId: savedInvoice.customerId,
      totalAmount: savedInvoice.totalAmount,
      timestamp: new Date().toISOString(),
    });

    return savedInvoice;
  }
}
