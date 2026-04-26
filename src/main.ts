import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './interceptors/error-logging.interceptor';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const logger = new Logger(bootstrap.name);

  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['log', 'warn', 'error']
      : ['debug', 'log', 'warn', 'error', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('Swagger doc')
    .setDescription('The server API description')
    .setVersion('1.0')
    .addTag('doc')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  console.log(
    `Server is running on http://localhost:${process.env.PORT || 4000}`,
  );

  await app.listen(process.env.PORT || 4000);

  process.on('uncaughtException', (error: any, origin: any) => {
    logger.error({
      module: 'main process',
      method: 'uncaughtException',
      correlationId: 'To be implemented',
      timestamp: new Date().toISOString(),
      error: error?.message,
      stack: error?.stack,
      origin: origin,
    });
  });

  process.on('unhandledRejection', (err: any) => {
    logger.error({
      module: 'main process',
      method: 'unhandledRejection',
      correlationId: 'To be implemented',
      timestamp: new Date().toISOString(),
      error: err?.message,
    });
  });

  process.on('exit', (code) => {
    logger.error({
      module: 'main process',
      method: 'exit',
      correlationId: 'To be implemented',
      timestamp: new Date().toISOString(),
      error: code,
    });
  });

  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  // Handle graceful shutdown on SIGINT (when user interrupts the process)
  process.on('SIGINT', async () => {
    logger.log('Received SIGINT. Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
