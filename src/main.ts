import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
const port=3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Customer_Service')
    .setDescription('Customer Service BAckend APIS')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document,{
  });
  await app.listen(port);
  Logger.log(`🚀  Server is listening on port ${port}`, 'Bootstrap');

}
bootstrap();

