import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { PORT_NAME } from 'utils/config';
import { setupSwagger } from './function/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(express.json({ limit: '50mb' }));
  setupSwagger(app);
  await app.listen(PORT_NAME);
  console.log(`App listens at Port ${PORT_NAME}`);
}
bootstrap();
