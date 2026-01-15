// src/modules/import-file/import-file.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportFile, ImportStatus } from '../../database/entity/import-file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileManagerService {
    constructor(
        @InjectRepository(ImportFile)
        private readonly importFileRepo: Repository<ImportFile>,
    ) { }

    async getList(params: {
        page?: number;
        limit?: number;
        status?: ImportStatus;
    }) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const skip = (page - 1) * limit;

        const qb = this.importFileRepo
            .createQueryBuilder('f')
            .leftJoin('f.customers', 'c')
            .leftJoin('f.new_sales', 'n')
            .leftJoin('f.transfers', 't')
            .loadRelationCountAndMap('f.customer_count', 'f.customers')
            .loadRelationCountAndMap('f.new_sale_count', 'f.new_sales')
            .loadRelationCountAndMap('f.transfer_count', 'f.transfers')
            .orderBy('f.imported_at', 'DESC')
            .skip(skip)
            .take(limit);

        if (params.status) {
            qb.andWhere('f.status = :status', { status: params.status });
        }

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_page: Math.ceil(total / limit),
            },
        };
    }
}
