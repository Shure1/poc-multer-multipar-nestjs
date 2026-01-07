import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requests desde Live Server u otros orígenes
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  logger.log('CORS enabled for all origins');
  await app.listen(3000);
  logger.log('🚀 Application listening on http://localhost:3000');
}
bootstrap();
