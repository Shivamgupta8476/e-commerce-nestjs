import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, customerLoginDto } from './customer.dto';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';

@ApiTags('Customer')
@Controller('/customer')
@ApiBearerAuth()
export class CustomerController {
  constructor(
    private service: CustomerService,
    private readonly logger: Logger,
    @Inject('PRODUCT_SERVICE') private readonly customer2Product: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly customer2Order: ClientProxy,
  ) { }
  @Post('/create')
  @ApiOkResponse({
    description: 'craete customer profile',
  })
  async createCustomer(
    @Body() createCustomerReq: CreateCustomerDto,
  ): Promise<any> {
    this.logger.log('Request made to create Customer');
    try {
      return await this.service.createCustomerProfile(createCustomerReq);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      return new HttpException('Internal Server Error', 500);
    }
  }
  @Post('/login')
  @ApiOkResponse({
    description: 'Customer login',
  })
  async login(@Body() loginCustomerReq: customerLoginDto): Promise<any> {
    this.logger.log('Request made to login');
    try {
      return await this.service.Customerlogin(loginCustomerReq);
    } catch (e) {
      this.logger.error(
        `Error occured while Customer login :${JSON.stringify(e)}`,
      );
      return new HttpException('Internal Server Error', 500);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get(':CustomerId')
  @ApiOkResponse({
    description: 'Get Customer Data',
  })
  async getCustomerData(
    @Param('CustomerId') CustomerId: string,
    @Req() req: Request,
  ): Promise<any> {
    this.logger.log('Enter into getCustomerData');
    try {
      return await this.service.getCustomerData(CustomerId);
    } catch (e) {
      this.logger.error(
        `Error occured fetching Customer Data :${JSON.stringify(e)}`,
      );
      return new HttpException('Internal Server Error', 500);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put(':CustomerId')
  @ApiOkResponse({
    description: 'Update Customer Data',
  })
  async updateCustomerData(
    @Param('CustomerId') CustomerId: string,
    @Body() updateCustomer: CreateCustomerDto,
  ): Promise<any> {
    this.logger.log('Enter into updatetCustomerData');
    try {
      return await this.service.updateCustomerData(CustomerId, updateCustomer);
    } catch (e) {
      this.logger.error(
        `Error occured Updating Customer Data :${JSON.stringify(e)}`,
      );
      return new HttpException('Internal Server Error', 500);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':CustomerId')
  @ApiOkResponse({
    description: 'Delete Customer Data',
  })
  async deleteCustomerData(
    @Param('CustomerId') CustomerId: string,
  ): Promise<any> {
    this.logger.log('Enter into deleteCustomerData');
    try {
      return await this.service.deleteCustomerData(CustomerId);
    } catch (e) {
      this.logger.error(
        `Error occured while deleting Customer Data :${JSON.stringify(e)}`,
      );
      return new HttpException('Internal Server Error', 500);
    }
  }
}
