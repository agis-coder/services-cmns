import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
    constructor(private readonly dataSource: DataSource) { }

    getDataSource(): DataSource {
        return this.dataSource;
    }

    async query<T = any>(sql: string, params?: any[]): Promise<T> {
        return this.dataSource.query(sql, params);
    }
}