import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomerSchema, CustomerModel } from './customer/customer.schema';
import { CustomerController } from './customer/customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerService } from './customer/customer.service';
import {AuthenticationMiddleware, AuthorizationMiddleware } from './middleware/auth.services';


@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://Shivamgupta:fIffetcE6AVPQRAG@cluster0.hulfv.mongodb.net/e-commerce"),
    MongooseModule.forFeature([{ name: CustomerModel.name, schema: CustomerSchema }]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService,Logger],
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
        { path: '/customer/:CustomerId', method: RequestMethod.DELETE},
        );
  }
  
}
