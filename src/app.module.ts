import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CustomerSchema, CustomerModel } from './customer/customer.schema';
import { CustomerController } from './customer/customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerService } from './customer/customer.service';
import {
  AuthenticationMiddleware,
  AuthorizationMiddleware,
} from './middleware/auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from './middleware/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: CustomerModel.name, schema: CustomerSchema },
    ]),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Product_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, Logger, JwtAuthGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: '/customer/create', method: RequestMethod.POST },
        { path: '/customer/login', method: RequestMethod.POST },
      )
      .forRoutes('*');

    consumer
      .apply(AuthorizationMiddleware)
      .forRoutes(
        { path: '/customer/:CustomerId', method: RequestMethod.GET },
        { path: '/customer/:CustomerId', method: RequestMethod.PUT },
        { path: '/customer/:CustomerId', method: RequestMethod.DELETE },
      );
  }
}
