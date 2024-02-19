import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'body-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
const port = 3000;
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_URI, ,],
      queue: 'Customer_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Customer_Service')
    .setDescription('Customer Service BAckend APIS')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}/`, 'Local Server')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
      scheme: 'bearer',
    })

    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {});

  // It Enables Cors For All Domain
  app.enableCors();

  // Helmet helps you secure your Express apps by setting various HTTP headers.
  app.use(helmet());
  app.use(json({ limit: '50mb' }));
  // app.useGlobalInterceptors(new NewrelicInterceptor);
  await app.listen(port);
  Logger.log(`🚀  Server is listening on port ${port}`, 'Bootstrap');
}
bootstrap();
