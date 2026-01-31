import { Injectable, NotFoundException } from "@nestjs/common";
import { Project } from "../../database/entity/project.entity";
import { DataSource } from "typeorm";
import { ProjectCategory } from "../../common/enums/project-category";

interface ProjectTemp {
    project_id: string;
    project_name: string;
    customerSet: Set<string>;
    emailSet: Set<string>;
    phoneSet: Set<string>;
}

interface InvestorTemp {
    investor: string;
    quantity: number;              // số project
    totalCustomers: number;
    totalEmails: Set<string>;
    totalPhones: Set<string>;
    customerSet: Set<string>;
    projectMap: Map<string, ProjectTemp>;
}

// ===== RESPONSE =====
interface ProjectSummary {
    project_id: string;
    project_name: string;
    quantity: number;
    email_quantity: number;
    phone_quantity: number;
}

interface InvestorSummary {
    investor: string;
    quantity: number;              // số project
    totalCustomers: number;        // khách unique
    totalEmails: number;
    totalPhones: number;
    list: ProjectSummary[];
}

@Injectable()
export class ProjectService {
    constructor(private readonly dataSource: DataSource) { }

    async getProjects(page = 1, pageSize = 20, search?: string): Promise<{
        data: { id: string; project_name: string; investor: string }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        const qb = this.dataSource
            .getRepository(Project)
            .createQueryBuilder('p');

        if (search) {
            qb.where('LOWER(p.project_name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        qb.orderBy('p.project_name', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        const [projects, total] = await qb.getManyAndCount();

        const formatted = projects.map(p => ({
            id: p.id,
            project_name: p.project_name,
            investor: p.investor,
        }));

        return {
            data: formatted,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async getProjectById(id: string) {
        const project = await this.dataSource.getRepository(Project).findOne({ where: { id } });
        if (!project) throw new NotFoundException("Project not found");
        return project;
    }

    async createProject(payload: Partial<Project>) {
        const repo = this.dataSource.getRepository(Project);
        const project = repo.create(payload);
        return repo.save(project);
    }

    async updateProject(id: string, payload: Partial<Project>) {
        const repo = this.dataSource.getRepository(Project);
        const project = await repo.findOne({ where: { id } });
        if (!project) throw new NotFoundException("Project not found");
        Object.assign(project, payload);
        return repo.save(project);
    }

    async deleteProject(id: string) {
        const repo = this.dataSource.getRepository(Project);
        const result = await repo.delete(id);
        if (result.affected === 0) throw new NotFoundException("Project not found");
        return { message: "Deleted successfully" };
    }

    private extractEmails(raw: string): string[] {
        if (!raw) return [];
        return raw
            .toLowerCase()
            .split(/[\s|,:;-]+/)
            .filter(v => v.includes('@'))
            .map(v => v.trim())
            .filter(v => v.length > 3);
    }

    private extractPhones(raw: string): string[] {
        if (!raw) return [];
        return raw
            .split(/[\s|,:;-]+/)
            .map(v => v.replace(/\D/g, ''))
            .filter(v =>
                (v.startsWith('0') && v.length >= 9 && v.length <= 11) ||
                (v.startsWith('84') && v.length >= 11 && v.length <= 13)
            );
    }

    async getInvestorsByCategory(
        category: ProjectCategory,
    ): Promise<InvestorSummary[]> {
        const rows = await this.dataSource
            .createQueryBuilder()
            .from('projects', 'p')
            .leftJoin('project_details', 'd', 'd.project_id = p.id')
            .leftJoin('project_new_sales', 'ns', 'ns.project_detail_id = d.id')
            .leftJoin('customers', 'c', 'c.id = ns.customerId')
            .select([
                'p.investor AS investor',
                'p.id AS project_id',
                'p.project_name AS project_name',
                'c.id AS customer_id',           // ✅ rất quan trọng
                'c.email AS email',
                'c.phone_number AS phone',
            ])
            .where('p.project_category = :category', { category })
            .andWhere('p.investor IS NOT NULL')
            .getRawMany();

        const investorMap = new Map<string, InvestorTemp>();

        for (const row of rows) {
            // ===== INIT INVESTOR =====
            if (!investorMap.has(row.investor)) {
                investorMap.set(row.investor, {
                    investor: row.investor,
                    quantity: 0,                       // số project
                    totalCustomers: 0,                 // set sau
                    totalEmails: new Set<string>(),
                    totalPhones: new Set<string>(),
                    customerSet: new Set<string>(),    // ✅ FIX
                    projectMap: new Map<string, ProjectTemp>(),
                });
            }

            const investorItem = investorMap.get(row.investor)!;

            // ===== INIT PROJECT =====
            if (!investorItem.projectMap.has(row.project_id)) {
                investorItem.projectMap.set(row.project_id, {
                    project_id: row.project_id,
                    project_name: row.project_name,
                    customerSet: new Set<string>(),
                    emailSet: new Set<string>(),
                    phoneSet: new Set<string>(),
                });

                investorItem.quantity += 1;
            }

            const projectItem = investorItem.projectMap.get(row.project_id)!;

            // ===== CUSTOMER (UNIQUE) =====
            if (row.customer_id) {
                investorItem.customerSet.add(row.customer_id);
                projectItem.customerSet.add(row.customer_id);
            }

            // ===== EMAIL =====
            this.extractEmails(row.email).forEach(email => {
                investorItem.totalEmails.add(email);
                projectItem.emailSet.add(email);
            });

            // ===== PHONE =====
            this.extractPhones(row.phone).forEach(phone => {
                investorItem.totalPhones.add(phone);
                projectItem.phoneSet.add(phone);
            });
        }

        // ===== BUILD RESULT =====
        const result: InvestorSummary[] = [];

        for (const investorItem of investorMap.values()) {
            const projects: ProjectSummary[] = [];

            for (const projectItem of investorItem.projectMap.values()) {
                projects.push({
                    project_id: projectItem.project_id,
                    project_name: projectItem.project_name,
                    quantity:
                        projectItem.emailSet.size + projectItem.phoneSet.size,
                    email_quantity: projectItem.emailSet.size,
                    phone_quantity: projectItem.phoneSet.size,
                });
            }

            result.push({
                investor: investorItem.investor,
                quantity: investorItem.quantity,
                totalCustomers: investorItem.customerSet.size, // ✅ FIX CHUẨN
                totalEmails: investorItem.totalEmails.size,
                totalPhones: investorItem.totalPhones.size,
                list: projects,
            });
        }

        return result;
    }


}
