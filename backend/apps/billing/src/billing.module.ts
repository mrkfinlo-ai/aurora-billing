import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

// Entities
import { Subscription } from './domain/entities/subscription.entity';
import { Usage } from './domain/entities/usage.entity';
import { Payment } from './domain/entities/payment.entity';
import { Invoice } from './domain/entities/invoice.entity';

// Services
import { PricingService } from './domain/services/pricing.service';
import { PaymentService } from './domain/services/payment.service';
import { InvoiceService } from './domain/services/invoice.service';
import { AnalyticsService } from './domain/services/analytics.service';

// Auth
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Subscription, Usage, Payment, Invoice]),

    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: { clientId: 'billing', brokers: [configService.get('KAFKA_BROKER')] },
            consumer: { groupId: 'billing-consumer' },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService, 
    PricingService, 
    PaymentService, 
    InvoiceService, 
    AnalyticsService, 
    JwtStrategy
  ],
  exports: [PricingService],
})
export class BillingModule {}
