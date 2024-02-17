import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ApiBearerAuth} from '@nestjs/swagger';
import { CreateCustomerDto} from './customer.dto';
import { CustomerModel } from './customer.schema';



@Injectable()
@ApiBearerAuth()
export class CustomerService {

    constructor(
        private readonly logger:Logger,
        @InjectModel(CustomerModel.name) private readonly CustomerServiceModel: Model<CustomerModel>,
    ){}


    async createCustomerProfile(data: CreateCustomerDto): Promise<any> {
        try {
            this.logger.log("Entered into createCustomerProfile",CustomerService.name);
            const checkEmailExist=await this.CustomerServiceModel.findOne({emailId:data.emailId}).exec();
            if(checkEmailExist){
                return "Email already exists"
            }
       
            const newCustomer = await this.CustomerServiceModel.create(data);
    
           return {
                message: 'User created successfully',
                success: true,
                data: newCustomer
            };
        } catch (error) {
           return error.message
        }
    }

}
