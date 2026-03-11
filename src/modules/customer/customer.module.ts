import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CacheModule } from '../caches/cache.module';
import { Customer } from '../../entities/customer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Customer]), CacheModule],
    controllers: [CustomerController],
    providers: [CustomerService],
})
export class CustomerModule { }
