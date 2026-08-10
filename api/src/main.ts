import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { config } from 'dotenv';
import { join } from 'path';

// Load the root .env file
config({ path: join(__dirname, '../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Increase payload limits for large video files
  app.use(express.json({ limit: '2000mb' }));
  app.use(express.urlencoded({ limit: '2000mb', extended: true }));

  // Log ALL incoming requests immediately
  app.use((req: any, res: any, next: any) => {
    Logger.log(`[HTTP] ${req.method} ${req.originalUrl || req.url}`, 'RequestLogger');
    next();
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  Logger.log(`🚀 Backend successfully started and listening on port ${port}`, 'Bootstrap');
}
bootstrap();
