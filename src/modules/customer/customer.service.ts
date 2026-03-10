import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Customer } from '../../database/entity/customer.entity';
import { ProjectNewSale } from '../../database/entity/project-new-sale.entity';
import { ProjectTransfer } from '../../database/entity/project-transfer.entity';
import { ProjectDetail } from '../../database/entity/project-detail.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../../common/dto/customer.dto';
import { CacheService } from '../caches/cache.service';
import { Project } from '../../database/entity/project.entity';

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
        private readonly cacheService: CacheService,
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

    // async findAllWithProjects(page = 1, pageSize = 30, search?: string, sourceDetail?: string, projectId?: string, country?: 'vn' | 'nn', birthday?: 'today' | 'tomorrow', sortByPurchase?: 'most' | 'least') {
    //     const cacheKey = this.cacheService.buildKey('customer_list', { page, pageSize, search, sourceDetail, projectId, country, birthday, sortByPurchase, });
    //     return this.cacheService.wrap(cacheKey, async () => {
    //         const normalizedSearch = normalizeSearch(search || '');
    //         const qb = this.customerRepo.createQueryBuilder('c').leftJoin(
    //             `(SELECT customerId,
    //                      COUNT(DISTINCT project_detail_id) AS project_count
    //               FROM (
    //                     SELECT customerId, project_detail_id FROM project_new_sales
    //                     UNION ALL
    //                     SELECT customerId, project_detail_id FROM project_transfers
    //               ) t
    //               GROUP BY customerId)`,
    //             'pc',
    //             'pc.customerId = c.id'
    //         )
    //             .select([
    //                 'c.id AS id',
    //                 'c.customer_name AS customer_name',
    //                 'c.phone_number AS phone_number',
    //                 'c.nationality AS nationality',
    //                 'c.address AS address',
    //                 'IFNULL(pc.project_count,0) AS project_count'
    //             ]);
    //         if (country === 'vn') {
    //             qb.andWhere('c.nationality LIKE :vn', { vn: '%vn%' });
    //         }

    //         if (country === 'nn') {
    //             qb.andWhere('(c.nationality IS NULL OR c.nationality NOT LIKE :vn)', {
    //                 vn: '%vn%',
    //             });
    //         }

    //         if (normalizedSearch) {
    //             const like = `%${normalizedSearch}%`;
    //             qb.andWhere(
    //                 `(c.customer_name LIKE :like
    //               OR c.phone_number LIKE :like
    //               OR c.address LIKE :like)`,
    //                 { like }
    //             );
    //         }

    //         if (birthday === 'today') {
    //             qb.andWhere(`
    //             c.date_of_birth IS NOT NULL
    //             AND DAY(c.date_of_birth) = DAY(CURDATE())
    //             AND MONTH(c.date_of_birth) = MONTH(CURDATE())
    //         `);
    //         }

    //         if (birthday === 'tomorrow') {
    //             qb.andWhere(`
    //             c.date_of_birth IS NOT NULL
    //             AND DAY(c.date_of_birth) = DAY(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
    //             AND MONTH(c.date_of_birth) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
    //         `);
    //         }

    //         if (projectId) {

    //             qb.andWhere(`
    //             EXISTS (
    //                 SELECT 1
    //                 FROM project_details pd
    //                 LEFT JOIN project_new_sales pns
    //                     ON pns.project_detail_id = pd.id
    //                 LEFT JOIN project_transfers pt
    //                     ON pt.project_detail_id = pd.id
    //                 WHERE pd.project_id = :projectId
    //                 AND (pns.customerId = c.id OR pt.customerId = c.id)
    //             )
    //         `, { projectId });

    //         }

    //         // sort
    //         if (sortByPurchase === 'most') {

    //             qb.orderBy('project_count', 'DESC');

    //         } else if (sortByPurchase === 'least') {

    //             qb.orderBy('project_count', 'ASC');

    //         } else {

    //             qb.orderBy('c.customer_name', 'ASC');

    //         }

    //         qb.offset((page - 1) * pageSize).limit(pageSize);
    //         const dataRaw = await qb.getRawMany();
    //         const totalQb = this.customerRepo.createQueryBuilder('c').select('COUNT(DISTINCT c.id)', 'total');

    //         if (country === 'vn') {
    //             totalQb.andWhere('c.nationality LIKE :vn', { vn: '%vn%' });
    //         }

    //         if (country === 'nn') {
    //             totalQb.andWhere('(c.nationality IS NULL OR c.nationality NOT LIKE :vn)', { vn: '%vn%', });
    //         }
    //         if (normalizedSearch) {
    //             const like = `%${normalizedSearch}%`;
    //             totalQb.andWhere(
    //                 `(c.customer_name LIKE :like
    //               OR c.phone_number LIKE :like
    //               OR c.address LIKE :like)`,
    //                 { like }
    //             );
    //         }

    //         if (projectId) {
    //             totalQb.andWhere(`
    //             EXISTS (
    //                 SELECT 1
    //                 FROM project_details pd
    //                 LEFT JOIN project_new_sales pns
    //                     ON pns.project_detail_id = pd.id
    //                 LEFT JOIN project_transfers pt
    //                     ON pt.project_detail_id = pd.id
    //                 WHERE pd.project_id = :projectId
    //                 AND (pns.customerId = c.id OR pt.customerId = c.id)
    //             )
    //         `, { projectId });

    //         }

    //         const totalRaw = await totalQb.getRawOne();
    //         const total = Number(totalRaw?.total ?? 0);


    //         const data = dataRaw.map((c: any) => ({
    //             id: c.id,
    //             customer_name: c.customer_name || 'Chưa có',
    //             phone_number: c.phone_number || 'Chưa có',
    //             nationality: c.nationality || 'Chưa có',
    //             address: c.address || 'Chưa có',
    //             project_count: Number(c.project_count ?? 0),

    //         }));
    //         return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize), };

    //     }, 300);
    // }

    async findAllWithProjects(
        page = 1,
        pageSize = 30,
        search?: string,
        sourceDetail?: string,
        projectId?: string,
        country?: 'vn' | 'nn',
        birthday?: 'today' | 'tomorrow',
        sortByPurchase?: 'most' | 'least',
    ) {
        const cacheKey = this.cacheService.buildKey('customer_list', {
            page,
            pageSize,
            search,
            sourceDetail,
            projectId,
            country,
            birthday,
            sortByPurchase,
        });

        return this.cacheService.wrap(cacheKey, async () => {
            const normalizedSearch = normalizeSearch(search || '');

            const qb = this.customerRepo
                .createQueryBuilder('c')
                .leftJoin(
                    `(SELECT customerId,
                COUNT(DISTINCT project_detail_id) AS project_count
         FROM (
           SELECT customerId, project_detail_id FROM project_new_sales
           UNION ALL
           SELECT customerId, project_detail_id FROM project_transfers
         ) t
         GROUP BY customerId)`,
                    'pc',
                    'pc.customerId = c.id',
                )
                .select([
                    'c.id AS id',
                    'c.customer_name AS customer_name',
                    'c.email AS email',
                    'c.phone_number AS phone_number',
                    'c.nationality AS nationality',
                    'c.address AS address',
                    'IFNULL(pc.project_count,0) AS project_count',
                ]);

            /* ---------------- SEARCH ---------------- */

            if (normalizedSearch) {
                const like = `%${normalizedSearch}%`;
                qb.andWhere(
                    `(c.customer_name LIKE :like
          OR c.phone_number LIKE :like
          OR c.address LIKE :like)`,
                    { like },
                );
            }

            /* ---------------- COUNTRY ---------------- */

            if (country === 'vn') {
                qb.andWhere('c.nationality LIKE :vn', { vn: '%vn%' });
            }

            if (country === 'nn') {
                qb.andWhere('(c.nationality IS NULL OR c.nationality NOT LIKE :vn)', {
                    vn: '%vn%',
                });
            }

            /* ---------------- BIRTHDAY ---------------- */

            if (birthday === 'today') {
                qb.andWhere(`
        c.date_of_birth IS NOT NULL
        AND DAY(c.date_of_birth) = DAY(CURDATE())
        AND MONTH(c.date_of_birth) = MONTH(CURDATE())
      `);
            }

            if (birthday === 'tomorrow') {
                qb.andWhere(`
        c.date_of_birth IS NOT NULL
        AND DAY(c.date_of_birth) = DAY(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
        AND MONTH(c.date_of_birth) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
      `);
            }

            /* ---------------- PROJECT FILTER ---------------- */

            if (projectId) {
                qb.andWhere(
                    `
        (
          EXISTS (
            SELECT 1
            FROM project_new_sales pns
            JOIN project_details pd ON pd.id = pns.project_detail_id
            WHERE pd.project_id = :projectId
            AND pns.customerId = c.id
          )
          OR
          EXISTS (
            SELECT 1
            FROM project_transfers pt
            JOIN project_details pd2 ON pd2.id = pt.project_detail_id
            WHERE pd2.project_id = :projectId
            AND pt.customerId = c.id
          )
        )
        `,
                    { projectId },
                );
            }

            /* ---------------- SORT ---------------- */

            if (sortByPurchase === 'most') {
                qb.orderBy('project_count', 'DESC');
            } else if (sortByPurchase === 'least') {
                qb.orderBy('project_count', 'ASC');
            } else {
                qb.orderBy('c.customer_name', 'ASC');
            }

            /* ---------------- PAGINATION ---------------- */

            qb.offset((page - 1) * pageSize).limit(pageSize);

            const dataRaw = await qb.getRawMany();

            /* ---------------- TOTAL QUERY ---------------- */

            const totalQb = this.customerRepo
                .createQueryBuilder('c')
                .select('COUNT(DISTINCT c.id)', 'total');

            if (normalizedSearch) {
                const like = `%${normalizedSearch}%`;
                totalQb.andWhere(
                    `(c.customer_name LIKE :like
          OR c.phone_number LIKE :like
          OR c.address LIKE :like)`,
                    { like },
                );
            }

            if (country === 'vn') {
                totalQb.andWhere('c.nationality LIKE :vn', { vn: '%vn%' });
            }

            if (country === 'nn') {
                totalQb.andWhere('(c.nationality IS NULL OR c.nationality NOT LIKE :vn)', {
                    vn: '%vn%',
                });
            }

            if (birthday === 'today') {
                totalQb.andWhere(`
        c.date_of_birth IS NOT NULL
        AND DAY(c.date_of_birth) = DAY(CURDATE())
        AND MONTH(c.date_of_birth) = MONTH(CURDATE())
      `);
            }

            if (birthday === 'tomorrow') {
                totalQb.andWhere(`
        c.date_of_birth IS NOT NULL
        AND DAY(c.date_of_birth) = DAY(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
        AND MONTH(c.date_of_birth) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
      `);
            }

            if (projectId) {
                totalQb.andWhere(
                    `
        (
          EXISTS (
            SELECT 1
            FROM project_new_sales pns
            JOIN project_details pd ON pd.id = pns.project_detail_id
            WHERE pd.project_id = :projectId
            AND pns.customerId = c.id
          )
          OR
          EXISTS (
            SELECT 1
            FROM project_transfers pt
            JOIN project_details pd2 ON pd2.id = pt.project_detail_id
            WHERE pd2.project_id = :projectId
            AND pt.customerId = c.id
          )
        )
        `,
                    { projectId },
                );
            }

            const totalRaw = await totalQb.getRawOne();
            const total = Number(totalRaw?.total ?? 0);

            /* ---------------- FORMAT DATA ---------------- */

            const data = dataRaw.map((c: any) => ({
                id: c.id,
                customer_name: c.customer_name || 'Chưa có',
                email: c.email || 'Chưa có',
                phone_number: c.phone_number || 'Chưa có',
                nationality: c.nationality || 'Chưa có',
                address: c.address || 'Chưa có',
                project_count: Number(c.project_count ?? 0),
            }));

            return {
                data,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        }, 300);
    }

    async searchCustomersWithProjects(search: string, page = 1, pageSize = 20, sourceDetail?: string, customerName?: string) {
        return this.findAllWithProjects(page, pageSize, search, sourceDetail);
    }

    async getAllSources() {
        const cacheKey = 'customer_sources';
        return this.cacheService.wrap(cacheKey, async () => {
            const raw = await this.dataSource.query("SELECT DISTINCT p.investor AS source FROM (SELECT project_detail_id FROM project_new_sales UNION ALL SELECT project_detail_id FROM project_transfers) t JOIN project_details pd ON pd.id = t.project_detail_id JOIN projects p ON p.id = pd.project_id WHERE p.investor IS NOT NULL ORDER BY p.investor ASC");
            return raw.map((r: any) => r.source);
        }, 300);
    }

    async getProjectsByInvestor(investor?: string): Promise<any[]> {

        const qb = this.dataSource
            .createQueryBuilder()
            .select([
                'p.id AS id',
                'p.project_name AS project_name'
            ])
            .from(Project, 'p')
            .distinct(true)

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
