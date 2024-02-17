import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CustomerSchema, CustomerModel } from './customer/customer.schema';
import { CustomerController } from './customer/customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerService } from './customer/customer.service';


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
      //.apply(AuthMiddleware)
      //.forRoutes('*');
  }
  
}
