import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Customer } from '../entities/customer.entity';
import { RelativeCustomer } from '../entities/relative-customer.entity';
import { Employee } from '../entities/emloyee.entity';
import { OutsideSale } from '../entities/outside_sale.entity';
import { Project } from '../entities/project.entity';
import { ProjectTransfer } from '../entities/project-transfer.entity';
import { ProjectNewSale } from '../entities/project-new-sale.entity';
import { ImportFile } from '../entities/import-file.entity';
import { ProjectDetail } from '../entities/project-detail.entity';

import * as dotenv from 'dotenv';
dotenv.config();

export const entities = [
    Customer,
    RelativeCustomer,
    Employee,
    OutsideSale,
    Project,
    ProjectTransfer,
    ProjectNewSale,
    ImportFile,
    ProjectDetail,
];

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities,
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
    extra: {
        connectionLimit: 20,
    },
});

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities,
    migrations: ['src/database/migrations/*.ts'], // sửa dòng này
};

export const AppDataSource = new DataSource(dataSourceOptions);