import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IpGuard } from './common/guard/ip.guard';
import * as express from 'express';
import { join } from 'path';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', true);

  server.use('/uploads/images', express.static(join(__dirname, '..', 'public/uploads/images')),);
  server.use('/uploads/files', express.static(join(__dirname, '..', 'public/uploads/files')),);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const config = new DocumentBuilder()
    .setTitle('CMNS API')
    .setDescription('CRM / Customer Management API')
    .setVersion('1.0')
    .addApiKey({
      type: 'apiKey',
      name: 'X-Forwarded-For',
      in: 'header',
    },
      'ip-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);


  app.enableCors({
    origin: [
      'http://localhost:3000', 'http://192.168.1.156:3000', 'http://localhost:3001'

    ], // hoặc '*' để test
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  SwaggerModule.setup('api', app, document);
  app.useGlobalGuards(new IpGuard());
  await app.listen(process.env.PORT ?? 6001, '0.0.0.0');
}
bootstrap();
