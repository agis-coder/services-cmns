import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { RelativeCustomer } from './entity/relative-customer.entity';
import { Employee } from './entity/emloyee.entity';
import { OutsideSale } from './entity/outside_sale.entity';
import { Project } from './entity/project.entity';
import { ProjectTransfer } from './entity/project-transfer.entity';
import { ProjectNewSale } from './entity/project-new-sale.entity';
import { ImportFile } from './entity/import-file.entity';
import { ProjectDetail } from './entity/project-detail.entity';
import { PhoneEntity } from './entity/phone.entity';
import { EmailEntity } from './entity/email.entity';
import { DeviceEntity } from './entity/device.entity';
import { ZaloEntity } from './entity/zalo.entity';
import { FacebookEntity } from './entity/facebook.entity';
export const mysqlConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'derry',
    password: 'qweqwe',
    database: 'cmns',
    entities: [
        Customer,
        RelativeCustomer,
        Employee,
        OutsideSale,
        Project,
        ProjectTransfer,
        ProjectNewSale,
        ImportFile,
        ProjectDetail,
        DeviceEntity,
        PhoneEntity,
        EmailEntity,
        FacebookEntity,
        ZaloEntity,
    ],
    synchronize: false,
    logging: false,
};

export const AppDataSource = new DataSource({
    ...(mysqlConfig as any),
    migrations: ['src/database/migrations/*.ts'],
});

@Module({
    imports: [
        TypeOrmModule.forRoot(mysqlConfig),
        TypeOrmModule.forFeature(mysqlConfig.entities as any),
    ],
    exports: [TypeOrmModule],
})
export class MySQLModule { }
