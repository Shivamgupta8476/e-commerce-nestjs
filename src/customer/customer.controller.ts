import {
    Body,
    Controller,
    HttpException,
    Logger,
    Post,
    Req,
  } from '@nestjs/common';
  import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './customer.dto';
  
  @ApiTags('Customer')
  @Controller('customer')
  export class CustomerController {
    constructor(
      private service: CustomerService,
      private readonly logger: Logger,
    ) {}
    @Post()
    @ApiOkResponse({
      description: 'craete customer profile',
    })
    async createCustomer(
      @Body() createCustomerReq: CreateCustomerDto,
    ): Promise<any> {
      this.logger.log("Request made to create Customer");
      try {
        return await this.service.createCustomerProfile(createCustomerReq);
      } catch (e) {
        this.logger.error(
          `Error occured while creating user :${JSON.stringify(e)}`,
        );
        throw new HttpException('Internal Server Error', 500);
      }
    }
  }
  