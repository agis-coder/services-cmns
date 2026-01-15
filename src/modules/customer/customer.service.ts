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

    async findAllWithProjects(page = 1, pageSize = 20, search?: string, sourceDetail?: string, subdivision?: string, customerName?: string, country?: 'vn' | 'nn', birthday?: 'today' | 'tomorrow') {
        const normalizedSearch = normalizeSearch(search || '')
        const qb = this.customerRepo
            .createQueryBuilder('customer')
            .leftJoinAndSelect('customer.new_sales', 'new_sale')
            .leftJoinAndSelect('new_sale.project_detail', 'new_detail')
            .leftJoinAndSelect('new_detail.project', 'new_project')
            .leftJoinAndSelect('customer.transfers', 'transfer')
            .leftJoinAndSelect('transfer.project_detail', 'transfer_detail')
            .leftJoinAndSelect('transfer_detail.project', 'transfer_project')

        if (country === 'vn') {
            qb.andWhere(`LOWER(customer.nationality) LIKE :vn`, { vn: '%vn%' })
        }
        if (country === 'nn') {
            qb.andWhere(`customer.nationality IS NULL OR LOWER(customer.nationality) NOT LIKE :vn`, { vn: '%vn%' })
        }
        if (normalizedSearch) {
            const like = `%${normalizedSearch.toLowerCase()}%`
            qb.andWhere(` (LOWER(customer.customer_name) LIKE :like OR LOWER(customer.phone_number) LIKE :like OR LOWER(customer.email) LIKE :like OR LOWER(customer.address) LIKE :like)`, { like })
        }
        if (sourceDetail) {
            qb.andWhere(`(new_detail.source_details = :sourceDetail OR transfer_detail.source_details = :sourceDetail)`, { sourceDetail })
        }
        if (subdivision) {
            qb.andWhere(`(new_detail.subdivision = :subdivision OR transfer_detail.subdivision = :subdivision)`, { subdivision })
        }
        if (customerName) {
            qb.andWhere('LOWER(customer.customer_name) LIKE :customerName', { customerName: `%${customerName.toLowerCase()}%` })
        }
        if (birthday === 'today') {
            qb.andWhere(`customer.date_of_birth IS NOT NULL AND DAY(customer.date_of_birth) = DAY(CURDATE()) AND MONTH(customer.date_of_birth) = MONTH(CURDATE())`)
        }
        if (birthday === 'tomorrow') {
            qb.andWhere(`customer.date_of_birth IS NOT NULL AND DAY(customer.date_of_birth) = DAY(DATE_ADD(CURDATE(), INTERVAL 1 DAY)) AND MONTH(customer.date_of_birth) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 DAY))`)
        }
        qb.orderBy('customer.customer_name', 'ASC').skip((page - 1) * pageSize).take(pageSize)
        const [customers, total] = await qb.getManyAndCount()
        const formatted = customers.map(c => {
            const projects = [
                ...c.new_sales.map(ns => ({
                    project_name: ns.project_detail.project.project_name,
                    contract_price: ns.project_detail.contract_price,
                    type: 'new_sale',
                    result: ns.result_new || 'Chưa có',
                    first_interaction: ns.first_interaction_new || 'Chưa có',
                    closest_interaction: ns.closest_interaction_new || 'Chưa có',
                    employee_name: ns.employee?.empl_name || 'Chưa có',
                    outside_sale_name: ns.outside_sale?.outside_sales_name || 'Chưa có',
                    address: ns.project_detail.subdivision || 'Chưa có',
                    floor: ns.project_detail.floor || 'Chưa có',
                    source: ns.project_detail.source,
                    source_details: ns.project_detail.source_details,
                })),
                ...c.transfers.map(t => ({
                    project_name: t.project_detail.project.project_name,
                    contract_price: t.project_detail.contract_price,
                    type: 'transfer',
                    result: t.result_transfer || 'Chưa có',
                    first_interaction: t.first_interaction_transfer || 'Chưa có',
                    closest_interaction: t.closest_interaction_transfer || 'Chưa có',
                    employee_name: t.employee?.empl_name || 'Chưa có',
                    outside_sale_name: t.outside_sale?.outside_sales_name || 'Chưa có',
                    address: t.project_detail.subdivision || 'Chưa có',
                    floor: t.project_detail.floor || 'Chưa có',
                    source: t.project_detail.source,
                    source_details: t.project_detail.source_details,
                })),
            ]
            return {
                id: c.id,
                customer_name: c.customer_name || 'Chưa có',
                phone_number: c.phone_number || 'Chưa có',
                nationality: c.nationality || 'Chưa có',
                email: c.email || 'Chưa có',
                date_of_birth: c.date_of_birth || 'Chưa có',
                address: c.address || 'Chưa có',
                projects: projects.length ? projects : 'Chưa có',
            }
        })
        return { data: formatted, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
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

        const newSales = await this.dataSource.query(
            `SELECT pns.*, pd.source, pd.subdivision, pd.floor, pd.contract_price, p.project_name, pd.source_details
                FROM project_new_sales pns
                JOIN project_details pd ON pd.id = pns.project_detail_id
                JOIN projects p ON p.id = pd.project_id
                WHERE pns.customerId = ?
       ${sourceDetail ? 'AND pd.source_details = ?' : ''}`,
            sourceDetail ? [id, sourceDetail] : [id],
        );

        const transfers = await this.dataSource.query(
            `SELECT pt.*, pd.source, pd.subdivision, pd.floor, pd.contract_price, p.project_name, pd.source_details
                FROM project_transfers pt
                JOIN project_details pd ON pd.id = pt.project_detail_id
                JOIN projects p ON p.id = pd.project_id
                WHERE pt.customerId = ?
        ${sourceDetail ? 'AND pd.source_details = ?' : ''}`,
            sourceDetail ? [id, sourceDetail] : [id],
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


}
