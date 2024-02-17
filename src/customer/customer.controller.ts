import {
    Body,
    Controller,
    Get,
    HttpException,
    Logger,
    Param,
    Post,
    Put,
    Req,
    Res,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, customerLoginDto } from './customer.dto';
  
  @ApiTags('Customer')
  @Controller('/customer')
  @ApiBearerAuth()
  export class CustomerController {
    constructor(
      private service: CustomerService,
      private readonly logger: Logger,
    ) {}
    @Post('/create')
    @ApiOkResponse({
      description: 'craete customer profile',
    })
    async createCustomer(@Body() createCustomerReq: CreateCustomerDto): Promise<any> {
      this.logger.log("Request made to create Customer");
      try {
        return await this.service.createCustomerProfile(createCustomerReq);
      } catch (e) {
        this.logger.error(`Error occured while creating user :${JSON.stringify(e)}`);
        return new HttpException('Internal Server Error', 500);
      }
    }
    @Post('/login')
    @ApiOkResponse({
      description: 'Customer login',
    })
    async login(@Body() loginCustomerReq:customerLoginDto):Promise<any> {
      this.logger.log("Request made to login");
      try{
        return await this.service.Customerlogin(loginCustomerReq);
      }catch(e){
          this.logger.error(`Error occured while Customer login :${JSON.stringify(e)}`);
          return  new HttpException('Internal Server Error', 500);

      } 
    }

    @Get(':CustomerId')
    @ApiOkResponse({
      description: 'Get Customer Data',
    })
    async getCustomerData(@Param('CustomerId') CustomerId:string ,@Req() req: Request):Promise<any> {
      this.logger.log("Enter into getCustomerData");
      try{
        return await this.service.getCustomerData(CustomerId);
      }catch(e){
          this.logger.error(`Error occured fetching Customer Data :${JSON.stringify(e)}`);
          return  new HttpException('Internal Server Error', 500);

      } 
    }

    @Put(':CustomerId')
    @ApiOkResponse({
      description: 'Update Customer Data',
    })
    async updateCustomerData(@Param('CustomerId') CustomerId:string, @Body() updateCustomer:CreateCustomerDto):Promise<any> {
      this.logger.log("Enter into getCustomerData");
      try{
        return await this.service.updateCustomerData(CustomerId,updateCustomer);
      }catch(e){
          this.logger.error(`Error occured Updating Customer Data :${JSON.stringify(e)}`);
          return  new HttpException('Internal Server Error', 500);

      } 
    }

 
  }
  