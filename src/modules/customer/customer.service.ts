import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Customer } from '../../database/entity/customer.entity';
import { ProjectNewSale } from '../../database/entity/project-new-sale.entity';
import { ProjectTransfer } from '../../database/entity/project-transfer.entity';
import { ProjectDetail } from '../../database/entity/project-detail.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../../common/dto/customer.dto';

const CITY_ALIAS: Record<string, string> = {
    HCM: 'TP Hồ Chí Minh',
    HN: 'Hà Nội',
    DN: 'Đà Nẵng',
};

function normalizeSearch(search: string): string {
    if (!search) return '';
    const trimmed = search.trim();
    const upper = trimmed.toUpperCase();
    return CITY_ALIAS[upper] || trimmed;
}

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        private readonly dataSource: DataSource,
    ) { }

    async create(dto: CreateCustomerDto): Promise<Customer> {
        const customer = this.customerRepo.create(dto);
        return this.customerRepo.save(customer);
    }

    async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');
        Object.assign(customer, dto);
        return this.customerRepo.save(customer);
    }

    async remove(id: string): Promise<{ message: string }> {
        const result = await this.customerRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Customer not found');
        return { message: 'Customer deleted successfully' };
    }

    async findAllWithProjects(
        page = 1,
        pageSize = 100,
        search?: string,
        sourceDetail?: string,
        subdivision?: string,
        customerName?: string,
        country?: 'vn' | 'nn',
        birthday?: 'today' | 'tomorrow',
        sortByPurchase?: 'most' | 'least',
    ) {
        const normalizedSearch = normalizeSearch(search || '');

        const qb = this.customerRepo
            .createQueryBuilder('customer')
            .leftJoin('customer.new_sales', 'new_sale')
            .leftJoin('project_details', 'pd_ns', 'pd_ns.id = new_sale.project_detail_id')
            .leftJoin('customer.transfers', 'transfer')
            .leftJoin('project_details', 'pd_tf', 'pd_tf.id = transfer.project_detail_id')

            // ===== COUNT SỐ CĂN: DISTINCT THEO (PROJECT + UNIT_CODE) =====
            .addSelect(
                `
            COUNT(
                DISTINCT CONCAT(
                    COALESCE(pd_ns.project_id, pd_tf.project_id),
                    '_',
                    COALESCE(pd_ns.unit_code, pd_tf.unit_code)
                )
            )
            `,
                'purchase_count',
            )
            .groupBy('customer.id');

        // ===== FILTER =====
        if (country === 'vn') {
            qb.andWhere(`LOWER(customer.nationality) LIKE :vn`, { vn: '%vn%' });
        }

        if (country === 'nn') {
            qb.andWhere(`
            customer.nationality IS NULL
            OR LOWER(customer.nationality) NOT LIKE :vn
        `, { vn: '%vn%' });
        }

        if (normalizedSearch) {
            const like = `%${normalizedSearch.toLowerCase()}%`;
            qb.andWhere(
                `
            LOWER(customer.customer_name) LIKE :like
            OR LOWER(customer.phone_number) LIKE :like
            OR LOWER(customer.email) LIKE :like
            OR LOWER(customer.address) LIKE :like
            `,
                { like },
            );
        }

        if (customerName) {
            qb.andWhere('LOWER(customer.customer_name) LIKE :customerName', {
                customerName: `%${customerName.toLowerCase()}%`,
            });
        }

        if (birthday === 'today') {
            qb.andWhere(`
            customer.date_of_birth IS NOT NULL
            AND DAY(customer.date_of_birth) = DAY(CURDATE())
            AND MONTH(customer.date_of_birth) = MONTH(CURDATE())
        `);
        }

        if (birthday === 'tomorrow') {
            qb.andWhere(`
            customer.date_of_birth IS NOT NULL
            AND DAY(customer.date_of_birth) = DAY(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
            AND MONTH(customer.date_of_birth) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
        `);
        }

        // ===== SORT =====
        if (sortByPurchase === 'most') {
            qb.orderBy('purchase_count', 'DESC');
        } else if (sortByPurchase === 'least') {
            qb.orderBy('purchase_count', 'ASC');
        } else {
            qb.orderBy('customer.customer_name', 'ASC');
        }

        // ===== PAGINATION =====
        qb.skip((page - 1) * pageSize).take(pageSize);

        const [rawAndEntities, totalRaw] = await Promise.all([
            qb.getRawAndEntities(),
            qb.clone()
                .select('COUNT(DISTINCT customer.id)', 'total')
                .orderBy()
                .skip(undefined)
                .take(undefined)
                .getRawOne(),
        ]);

        const total = Number(totalRaw?.total) || 0;

        const data = rawAndEntities.entities.map((c, idx) => ({
            id: c.id,
            customer_name: c.customer_name || 'Chưa có',
            phone_number: c.phone_number || 'Chưa có',
            nationality: c.nationality || 'Chưa có',
            email: c.email || 'Chưa có',
            level: c.level ?? 0,
            isVip: !!c.isVip,
            date_of_birth: c.date_of_birth || 'Chưa có',
            address: c.address || 'Chưa có',
            project_count: Number(rawAndEntities.raw[idx]?.purchase_count ?? 0),
        }));

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }


    async searchCustomersWithProjects(search: string, page = 1, pageSize = 20, sourceDetail?: string, customerName?: string) {
        return this.findAllWithProjects(page, pageSize, search, sourceDetail);
    }

    async getCustomerDetail(id: string, sourceDetail?: string) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');

        const relatives = await this.dataSource.query(
            `SELECT r.*
         FROM relatives_customer r
         JOIN customer_relatives cr ON cr.relative_id = r.id
         WHERE cr.customer_id = ?`,
            [id],
        );

        const newSalesRaw = await this.dataSource.query(
            `SELECT pns.*,
                pd.project_id,
                pd.source, pd.subdivision, pd.floor, pd.unit_code, pd.contract_price,
                p.project_name, pd.source_details
         FROM project_new_sales pns
         JOIN project_details pd ON pd.id = pns.project_detail_id
         JOIN projects p ON p.id = pd.project_id
         WHERE pns.customerId = ?
         ${sourceDetail ? 'AND pd.source_details = ?' : ''}`,
            sourceDetail ? [id, sourceDetail] : [id],
        );

        const transfersRaw = await this.dataSource.query(
            `SELECT pt.*,
                pd.project_id,
                pd.source, pd.subdivision, pd.floor, pd.unit_code, pd.contract_price,
                p.project_name, pd.source_details
         FROM project_transfers pt
         JOIN project_details pd ON pd.id = pt.project_detail_id
         JOIN projects p ON p.id = pd.project_id
         WHERE pt.customerId = ?
         ${sourceDetail ? 'AND pd.source_details = ?' : ''}`,
            sourceDetail ? [id, sourceDetail] : [id],
        );

        const dedupeByProjectAndUnit = (rows: any[]) => {
            const map = new Map<string, any>();
            for (const r of rows) {
                if (!r.project_id || !r.unit_code) continue;
                const key = `${r.project_id}__${r.unit_code}`;
                if (!map.has(key)) map.set(key, r);
            }
            return Array.from(map.values());
        };

        const newSales = dedupeByProjectAndUnit(newSalesRaw ?? []);
        const transfers = dedupeByProjectAndUnit(transfersRaw ?? []);

        return {
            ...customer,
            relatives: relatives ?? [],
            projects: {
                new_sales: newSales,
                transfers: transfers,
            },
        };
    }



    async getProjectNamesBySource(source: string): Promise<string[]> {
        if (!source) return [];
        const rows = await this.dataSource
            .getRepository(ProjectDetail)
            .createQueryBuilder('pd')
            .innerJoin('pd.project', 'p')
            .select('DISTINCT p.project_name', 'project_name')
            .where('p.project_category = :source', { source })
            .orderBy('p.project_name', 'ASC')
            .getRawMany();

        return rows.map(r => r.project_name);
    }

    async getSubdivisionsBySource(source: string): Promise<string[]> {
        if (!source) return []
        const rows = await this.dataSource
            .getRepository(ProjectDetail)
            .createQueryBuilder('pd')
            .innerJoin('pd.project', 'p')
            .select('DISTINCT pd.subdivision', 'subdivision')
            .where('p.project_category = :source', { source })
            .andWhere('pd.subdivision IS NOT NULL')
            .andWhere("pd.subdivision <> ''")
            .orderBy('pd.subdivision', 'ASC')
            .getRawMany()

        return rows.map(r => r.subdivision)
    }


}
