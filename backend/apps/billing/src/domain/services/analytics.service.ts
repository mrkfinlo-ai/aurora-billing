import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment, PaymentState } from '../entities/payment.entity';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalInvoices: number;
  successfulPayments: number;
  averageDealSize: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async getOverview(): Promise<AnalyticsSummary> {
    // 1. Calculate Total Revenue (Sum of all ISSUED or PAID invoices)
    const revenueResult = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'total')
      .where('invoice.status IN (:...statuses)', { statuses: [InvoiceStatus.ISSUED, InvoiceStatus.PAID] })
      .getRawOne();

    // 2. Count Total Invoices
    const invoiceCount = await this.invoiceRepo.count();

    // 3. Count Successful Payments
    const paymentCount = await this.paymentRepo.count({
      where: { status: PaymentState.COMPLETED }
    });

    // 4. Calculate Average (Avoid division by zero)
    const total = parseFloat(revenueResult.total || '0');
    const avg = invoiceCount > 0 ? total / invoiceCount : 0;

    return {
      totalRevenue: total,
      totalInvoices: invoiceCount,
      successfulPayments: paymentCount,
      averageDealSize: parseFloat(avg.toFixed(2)),
    };
  }
}
