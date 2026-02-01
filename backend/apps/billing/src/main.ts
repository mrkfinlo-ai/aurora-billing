global['crypto'] = require('crypto');

import { NestFactory } from '@nestjs/core';
import { BillingModule } from './billing.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);
  app.enableCors();

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
