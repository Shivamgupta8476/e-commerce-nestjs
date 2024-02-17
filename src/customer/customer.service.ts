import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCustomerDto, customerLoginDto } from './customer.dto';
import { CustomerModel } from './customer.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';

@Injectable()
@ApiBearerAuth()
export class CustomerService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(CustomerModel.name)
    private readonly CustomerServiceModel: Model<CustomerModel>,
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
        id:  isValidUser._id,
        role:'user'
     },
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        { expiresIn: '5h' }, //secretkey
      );
      return {
        status: true,
        message: 'User login successfull',
        data: {
          userId: isValidUser._id,
          token: token,
        },
      };
    } catch (error) {
      return error.message;
    }
  }

  async getCustomerData(userId:string): Promise<any> {
    try {
      this.logger.log(
        'Entered into getCustomerData',
        CustomerService.name,
      );
      if (!userId) {
        throw new BadRequestException('Please provide userId');
      }
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('UserId is not valid');
      }
      const findCustomerDetails  = await this.CustomerServiceModel.findOne({ _id: userId }).exec();
      if (!findCustomerDetails) {
        return new HttpException('Customer Details not found', HttpStatus.NOT_FOUND);
      }

      return {
        status: true,
        message: 'User profile details',
        data: findCustomerDetails 
      };
    } catch (error) {
      return error.message;
    }
  }

  async updateCustomerData(userId:string,data:CreateCustomerDto): Promise<any> {
    try {
      this.logger.log(
        'Entered into updateCustomerData',
        CustomerService.name,
      );
      if (!userId) {
        throw new BadRequestException('Please provide userId');
      }
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('UserId is not valid');
      }
      const findCustomerDetails  = await this.CustomerServiceModel.findOne({ _id: userId }).exec();
      if (!findCustomerDetails) {
        return new HttpException('Customer Details not found', HttpStatus.NOT_FOUND);
      }

      return {
        status: true,
        message: 'User profile details',
        data: findCustomerDetails 
      };
    } catch (error) {
      return error.message;
    }
  }
}
