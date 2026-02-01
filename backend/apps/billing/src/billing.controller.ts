import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Services
import { PricingService } from './domain/services/pricing.service';
import { PaymentService } from './domain/services/payment.service';
import { InvoiceService } from './domain/services/invoice.service';
import { AnalyticsService } from './domain/services/analytics.service';

// DTOs & Entities
import { CalculateChargesDto } from './interfaces/http/dtos/calculate-charges.dto';
import { Subscription } from './domain/entities/subscription.entity';
import { Usage } from './domain/entities/usage.entity';

@Controller('billing')
@UseGuards(AuthGuard('jwt')) // Locks all endpoints
export class BillingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly analyticsService: AnalyticsService
  ) {}

  // 1. Calculate Charges
  @Post('calculate')
  async calculate(@Body() dto: CalculateChargesDto) {
    const subscription = new Subscription();
    subscription.customerId = dto.customerId;
    subscription.basePrice = dto.basePrice;

    const usageRecords = dto.usage.map(u => {
      const record = new Usage();
      record.unitType = u.unitType;
      record.quantity = u.quantity;
      return record;
    });

    const result = await this.pricingService.calculateCharges(subscription, usageRecords);

    return {
      success: true,
      data: result,
    };
  }

  // 2. Process Payment
  @Post('pay')
  async processPayment(@Body() body: { customerId: string; amount: number; invoiceId: string }) {
    const result = await this.paymentService.processPayment(
      body.customerId,
      body.amount,
      body.invoiceId
    );
    return { success: true, payment: result };
  }

  // 3. Generate Invoice
  @Post('invoice')
  async createInvoice(@Body() dto: CalculateChargesDto) {
    const sub = new Subscription();
    sub.id = 'sub_123';
    sub.customerId = dto.customerId;
    sub.basePrice = dto.basePrice;

    const usage = dto.usage.map(u => {
      const r = new Usage();
      r.unitType = u.unitType;
      r.quantity = u.quantity;
      return r;
    });

    const invoice = await this.invoiceService.generateInvoice(sub, usage);
    return { success: true, invoice };
  }

  // 4. Analytics Dashboard
  @Get('analytics')
  async getAnalytics() {
    const data = await this.analyticsService.getOverview();
    return { success: true, analytics: data };
  }
}
