import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from '../../database/entity/customer.entity';
import { CacheModule } from '../caches/cache.module';

@Module({
    imports: [TypeOrmModule.forFeature([Customer]), CacheModule],
    controllers: [CustomerController],
    providers: [CustomerService],
})
export class CustomerModule { }
