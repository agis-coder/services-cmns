// src/modules/import-file/import-file.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportFile, ImportStatus } from '../../database/entity/import-file.entity';

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
            .select([
                'f.id',
                'f.file_name',
                'f.status',
                'f.imported_at',
            ])
            .loadRelationCountAndMap('f.customer_count', 'f.customers')
            .loadRelationCountAndMap('f.new_sale_count', 'f.new_sales')
            .loadRelationCountAndMap('f.transfer_count', 'f.transfers')
            .orderBy('f.imported_at', 'DESC')
            .skip(skip)
            .take(limit);

        if (params.status) {
            qb.andWhere('f.status = :status', { status: params.status });
        }

        const data = await qb.getMany();

        const total = await this.importFileRepo.count({
            where: params.status ? { status: params.status } : {},
        });

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
