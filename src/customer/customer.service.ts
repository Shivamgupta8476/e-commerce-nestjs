import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCustomerDto, customerLoginDto } from './customer.dto';
import { CustomerModel } from './customer.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
@ApiBearerAuth()
export class CustomerService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(CustomerModel.name)
    private readonly CustomerServiceModel: Model<CustomerModel>,
    @Inject('PRODUCT_SERVICE') private readonly customer2Product: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly customer2Order: ClientProxy,
  ) {}

  async createCustomerProfile(data: CreateCustomerDto): Promise<any> {
    try {
      this.logger.log(
        'Entered into createCustomerProfile',
        CustomerService.name,
      );
      const checkEmailExist = await this.CustomerServiceModel.findOne({
        emailId: data.emailId,
      }).exec();
      if (checkEmailExist) {
        return 'Email already exists';
      }
      const hashedPassword = await bcrypt.hash(data.password, 12);
      data.password = hashedPassword;
      const newCustomer = await this.CustomerServiceModel.create(data);
      data['customer_id']=newCustomer._id;
      this.customer2Order.emit('create_customer', data);
      return {
        message: 'User created successfully',
        success: true,
        data: newCustomer,
      };
    } catch (error) {
      return error.message;
    }
  }

  async Customerlogin(data: customerLoginDto): Promise<any> {
    try {
      this.logger.log(
        'Entered into createCustomerProfile',
        CustomerService.name,
      );
      const isValidUser = await this.CustomerServiceModel.findOne({
        emailId: data.emailId,
      }).exec();
      if (!isValidUser) {
        return new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }
      const isPasswordValid = await bcrypt.compare(
        data.password,
        isValidUser.password,
      );
      if (!isPasswordValid) {
        return new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      let token = jwt.sign(
        {
          UserId: data.emailId,
          role:isValidUser.role,
          id: isValidUser._id,
        },
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        { expiresIn: '5h' }, //secretkey
      );
      return {
        status: true,
        message: 'User login successfull',
        data: {
          userId: isValidUser._id,
          role:isValidUser.role,
          token: token,
        },
      };
    } catch (error) {
      return error.message;
    }
  }

  async getCustomerData(userId: string): Promise<any> {
    try {
      this.logger.log('Entered into getCustomerData', CustomerService.name);
      const findCustomerDetails = await this.CustomerServiceModel.findOne({
        _id: userId,
      }).exec();
      if (!findCustomerDetails) {
        return new HttpException(
          'Customer Details not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: true,
        message: 'User profile details',
        data: findCustomerDetails,
      };
    } catch (error) {
      return error.message;
    }
  }

  async updateCustomerData(
    userId: string,
    data: CreateCustomerDto,
  ): Promise<any> {
    try {
      this.logger.log('Entered into updateCustomerData', CustomerService.name);
      const findCustomerDetails = await this.CustomerServiceModel.findOne({
        _id: userId,
      }).exec();
  
      if (!findCustomerDetails) {
        return new HttpException(
          'Customer Details not found',
          HttpStatus.NOT_FOUND,
        );
      }
  
      // Update customer details based on the provided data
      if (data?.firstName) {
        findCustomerDetails.firstName = data.firstName;
      }
      if (data?.lastName) {
        findCustomerDetails.lastName = data.lastName;
      }
      if (data?.phoneNo) {
        findCustomerDetails.phoneNo = data.phoneNo;
      }
      if (data?.emailId) {
        findCustomerDetails.emailId = data.emailId;
      }
      if (data?.password) {
        const hashedPassword = await bcrypt.hash(data.password, 12);
        findCustomerDetails.password = hashedPassword;
      }
  
      // Check if billingAddress exists in the data object before accessing its properties
      if (data?.billingAddress?.[0]?.state) {
        findCustomerDetails.billingAddress[0].state = data.billingAddress[0].state;
      }
      if (data?.billingAddress?.[0]?.city) {
        findCustomerDetails.billingAddress[0].city = data.billingAddress[0].city;
      }
      if (data?.billingAddress?.[0]?.pincode) {
        findCustomerDetails.billingAddress[0].pincode = data.billingAddress[0].pincode;
      }
  
      // Check if shippingAddress exists in the data object before accessing its properties
      if (data?.shippingAddress?.[0]?.state) {
        findCustomerDetails.shippingAddress[0].state = data.shippingAddress[0].state;
      }
      if (data?.shippingAddress?.[0]?.city) {
        findCustomerDetails.shippingAddress[0].city = data.shippingAddress[0].city;
      }
      if (data?.shippingAddress?.[0]?.pincode) {
        findCustomerDetails.shippingAddress[0].pincode = data.shippingAddress[0].pincode;
      }
      this.customer2Order.emit('update_customer', findCustomerDetails);
  
      const updateResponse = await this.CustomerServiceModel.findByIdAndUpdate(
        { _id: findCustomerDetails._id },
        findCustomerDetails,
        { new: true },
      ).exec();
  
      return {
        status: true,
        message: 'Customer profile Updated',
        data: updateResponse,
      };
    } catch (error) {
      return error.message;
    }
  }
  

  async deleteCustomerData(userId: string): Promise<any> {
    try {
      this.logger.log('Entered into deleteCustomerData', CustomerService.name);

      const findCustomerDetails =
        await this.CustomerServiceModel.findById(userId).exec();
      if (!findCustomerDetails) {
        return new HttpException(
          'Customer Details not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.CustomerServiceModel.deleteOne({ _id: userId }).exec();
      this.customer2Product.emit('delete_customer', userId);
      this.customer2Order.emit('delete_customer', userId);
      return {
        status: true,
        message: 'Customer profile deleted successfully',
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
