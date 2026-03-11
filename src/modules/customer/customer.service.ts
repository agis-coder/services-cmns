import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, DeepPartial } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { ProjectDetail } from '../../entities/project-detail.entity';
import { CreateCustomerDto } from '../../common/dto/customer.dto';
import { Project } from '../../entities/project.entity';
import { normalizeSearch } from '../../common/constants/customer';
import Redis from 'ioredis'
import { InjectRedis } from '@nestjs-modules/ioredis'

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        private readonly dataSource: DataSource,

        @InjectRedis()
        private readonly redis: Redis,
    ) { }

    async create(dto: CreateCustomerDto): Promise<Customer> {
        const exist = await this.customerRepo.findOne({
            where: { phone_number: dto.phone_number },
        });
        if (exist) {
            throw new BadRequestException('Số điện thoại này đã tồn tại');
        }
        const customer = this.customerRepo.create({
            ...dto,
            date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
        } as DeepPartial<Customer>);
        return await this.customerRepo.save(customer);
    }


    private CACHE_KEY = 'customer_full_list'

    async loadFullCustomerCache() {
        const cached = await this.redis.get(this.CACHE_KEY)
        if (cached) return JSON.parse(cached)

        const raw = await this.dataSource.query(`
      SELECT 
        c.id,
        c.customer_name,
        c.email,
        c.phone_number,
        c.nationality,
        c.address,
        c.date_of_birth,

        COUNT(DISTINCT pd.id) as project_count,

        GROUP_CONCAT(DISTINCT pd.project_id) as project_ids,
        GROUP_CONCAT(DISTINCT pd.source) as sources

      FROM customers c

      LEFT JOIN (
        SELECT customerId, project_detail_id FROM project_new_sales
        UNION ALL
        SELECT customerId, project_detail_id FROM project_transfers
      ) p ON p.customerId = c.id

      LEFT JOIN project_details pd ON pd.id = p.project_detail_id

      GROUP BY c.id
    `)

        await this.redis.set(this.CACHE_KEY, JSON.stringify(raw), 'EX', 600)

        return raw
    }

    async findAllWithProjects(
        page = 1,
        pageSize = 30,
        search?: string,
        source?: string,
        projectId?: string,
        country?: 'vn' | 'nn',
        birthday?: 'today' | 'tomorrow',
        sortByPurchase?: 'most' | 'least',
        hasEmail?: 'yes' | 'no' | 'all',
    ) {
        let data = await this.loadFullCustomerCache()

        const normalizedSearch = (search || '').toLowerCase()

        if (normalizedSearch) {
            data = data.filter((c: any) =>
                (c.customer_name || '').toLowerCase().includes(normalizedSearch) ||
                (c.phone_number || '').toLowerCase().includes(normalizedSearch) ||
                (c.address || '').toLowerCase().includes(normalizedSearch),
            )
        }

        if (hasEmail === 'yes') {
            data = data.filter((c: any) => c.email && c.email.trim() !== '')
        }

        if (hasEmail === 'no') {
            data = data.filter((c: any) => !c.email || c.email.trim() === '')
        }

        if (country === 'vn') {
            data = data.filter((c: any) =>
                (c.nationality || '').toLowerCase().includes('vn'),
            )
        }

        if (country === 'nn') {
            data = data.filter((c: any) =>
                !(c.nationality || '').toLowerCase().includes('vn'),
            )
        }

        // if (source && source.trim() === 'BĐS') {
        //     data = data.filter((c: any) => {
        //         if (!c.sources) return false

        //         const list = String(c.sources)
        //             .split(',')
        //             .map((s: string) => s.trim())
        //             .filter(Boolean)

        //         return list.includes(source)
        //     })
        // }

        if (projectId) {
            data = data.filter((c: any) =>
                (c.project_ids || '').includes(projectId),
            )
        }

        if (birthday === 'today') {
            const today = new Date()
            data = data.filter((c: any) => {
                if (!c.date_of_birth) return false
                const d = new Date(c.date_of_birth)
                return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
            })
        }

        if (birthday === 'tomorrow') {
            const t = new Date()
            t.setDate(t.getDate() + 1)

            data = data.filter((c: any) => {
                if (!c.date_of_birth) return false
                const d = new Date(c.date_of_birth)
                return d.getDate() === t.getDate() && d.getMonth() === t.getMonth()
            })
        }

        if (sortByPurchase === 'most') {
            data.sort((a: any, b: any) => b.project_count - a.project_count)
        }

        if (sortByPurchase === 'least') {
            data.sort((a: any, b: any) => a.project_count - b.project_count)
        }

        if (!sortByPurchase) {
            data.sort((a: any, b: any) =>
                (a.customer_name || '').localeCompare(b.customer_name || ''),
            )
        }

        const total = data.length

        const start = (page - 1) * pageSize
        const end = start + pageSize

        const result = data.slice(start, end).map((c: any) => ({
            id: c.id,
            customer_name: c.customer_name || 'Chưa có',
            email: c.email || 'Chưa có',
            phone_number: c.phone_number || 'Chưa có',
            nationality: c.nationality || 'Chưa có',
            address: c.address || 'Chưa có',
            project_count: Number(c.project_count ?? 0),
        }))

        return {
            data: result,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        }
    }

    async clearCustomerCache() {
        await this.redis.del(this.CACHE_KEY)
    }

    async getAllSources() {
        const cacheKey = 'customer_sources'

        const cached = await this.redis.get(cacheKey)
        if (cached) return JSON.parse(cached)

        const raw = await this.dataSource.query(`
      SELECT DISTINCT p.investor AS source
      FROM (
        SELECT project_detail_id FROM project_new_sales
        UNION ALL
        SELECT project_detail_id FROM project_transfers
      ) t
      JOIN project_details pd ON pd.id = t.project_detail_id
      JOIN projects p ON p.id = pd.project_id
      WHERE p.investor IS NOT NULL
      ORDER BY p.investor ASC
    `)

        const result = raw.map((r: any) => r.source)

        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 600)

        return result
    }

    async searchCustomersWithProjects(search: string, page = 1, pageSize = 20, source?: string, customerName?: string) {
        return this.findAllWithProjects(page, pageSize, search, source);
    }

    async getProjectsByInvestor(investor?: string): Promise<any[]> {
        const qb = this.dataSource.createQueryBuilder().select([
            'p.id AS id',
            'p.project_name AS project_name'
        ]).from(Project, 'p').distinct(true)
        if (investor && investor !== 'all') {
            qb.where('p.investor = :investor', { investor })
        }
        const rows = await qb.getRawMany()
        return rows
    }

    async getCustomerDetail(id: string, sourceDetail?: string) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const relatives = await this.dataSource.query(
            `SELECT r.*
         FROM relatives_customer r
         JOIN customer_relatives cr ON cr.relative_id = r.id
         WHERE cr.customer_id = ?`,
            [id],
        );

        const condition = sourceDetail ? `AND pd.source_details = ?` : '';

        const params = sourceDetail ? [id, sourceDetail] : [id];

        const newSales = await this.dataSource.query(
            `
        SELECT 
            pd.project_id,
            p.project_name,
            pd.source_details,
            COUNT(DISTINCT pd.unit_code) AS total_units
        FROM project_new_sales pns
        JOIN project_details pd ON pd.id = pns.project_detail_id
        JOIN projects p ON p.id = pd.project_id
        WHERE pns.customerId = ?
        ${condition}
        GROUP BY pd.project_id, p.project_name, pd.source_details
        ORDER BY total_units DESC
        `,
            params,
        );

        const transfers = await this.dataSource.query(
            `
        SELECT 
            pd.project_id,
            p.project_name,
            pd.source_details,
            COUNT(DISTINCT pd.unit_code) AS total_units
        FROM project_transfers pt
        JOIN project_details pd ON pd.id = pt.project_detail_id
        JOIN projects p ON p.id = pd.project_id
        WHERE pt.customerId = ?
        ${condition}
        GROUP BY pd.project_id, p.project_name, pd.source_details
        ORDER BY total_units DESC
        `,
            params,
        );

        return {
            ...customer,
            relatives: relatives ?? [],
            projects: {
                new_sales: newSales ?? [],
                transfers: transfers ?? [],
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

    async getCustomerProjectUnits(customerId: string, projectId: string) {

        const rows = await this.dataSource.query(
            `
        SELECT DISTINCT
            pd.id as project_detail_id,
            pd.project_id,
            p.project_name,
            pd.unit_code,
            pd.product_type ,
            pd.subdivision,
            pd.floor,
            pd.source,
            pd.source_details,
            pd.contract_price
        FROM project_details pd
        JOIN projects p ON p.id = pd.project_id

        LEFT JOIN project_new_sales pns 
            ON pns.project_detail_id = pd.id 
            AND pns.customerId = ?

        LEFT JOIN project_transfers pt 
            ON pt.project_detail_id = pd.id 
            AND pt.customerId = ?

        WHERE pd.project_id = ?
        AND (
            pns.customerId IS NOT NULL
            OR pt.customerId IS NOT NULL
        )

        ORDER BY pd.subdivision, pd.floor, pd.unit_code
        `,
            [customerId, customerId, projectId],
        );

        return rows ?? [];
    }

    async updateCustomer(id: string, body: any) {

        const repo = this.dataSource.getRepository(Customer);

        const customer = await repo.findOne({ where: { id } });

        if (!customer) {
            throw new Error("Customer not found");
        }

        const allowedFields = [
            "customer_name",
            "phone_number",
            "img_customer",
            "date_of_birth",
            "cccd",
            "email",
            "gender",
            "address",
            "permanent_address",
            "living_area",
            "the_product_type",
            "nationality",
            "marital_status",
            "interest",
            "total_assets",
            "business_field",
            "zalo_status",
            "facebook",
            "isVip",
            "level"
        ];

        const payload: any = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) {

                let value = body[key];

                // fix empty string
                if (value === "") {
                    value = null;
                }

                payload[key] = value;
            }
        }

        await repo.update(id, payload);

        const updated = await repo.findOne({ where: { id } });

        return {
            message: "Update customer success",
            data: updated
        };
    }
}
