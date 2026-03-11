import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Project } from "../../entities/project.entity";
import { ProjectDetail } from "../../entities/project-detail.entity";
import { ProjectCategory } from "../../common/enums/project-category";

interface InvestorTemp {
    investor: string
    quantity: number
    projectMap: Map<string, ProjectTemp>
}

interface ProjectTemp {
    project_id: string
    project_name: string
    customerSet: Set<string>
    emailSet: Set<string>
    phoneSet: Set<string>
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

    async getProjects(
        search?: string,
        category?: ProjectCategory,
        investor?: string
    ): Promise<{
        total: number;
        data: {
            id: string;
            project_name: string;
            investor: string;
            project_category: ProjectCategory;
        }[];
    }> {

        const repo = this.dataSource.getRepository(Project);
        const qb = repo.createQueryBuilder("p");

        // search theo tên dự án
        if (search) {
            qb.andWhere("LOWER(p.project_name) LIKE :search", {
                search: `%${search.toLowerCase()}%`,
            });
        }

        // filter category
        if (category) {
            qb.andWhere("p.project_category = :category", { category });
        }

        // filter investor
        if (investor) {
            qb.andWhere("LOWER(p.investor) LIKE :investor", {
                investor: `%${investor.toLowerCase()}%`,
            });
        }

        const projects = await qb
            .orderBy("p.project_name", "ASC")
            .getMany();

        return {
            total: projects.length,
            data: projects.map(p => ({
                id: p.id,
                project_name: p.project_name,
                investor: p.investor,
                project_category: p.project_category,
            })),
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

    async updateProject(id: string, body: any) {

        const repo = this.dataSource.getRepository(Project);

        const project = await repo.findOne({
            where: { id }
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // chỉ giữ field hợp lệ
        const payload: Partial<Project> = {
            project_name: body.project_name,
            investor: body.investor,
            project_category: body.project_category
        };

        await repo.update(id, payload);

        const updated = await repo.findOne({ where: { id } });

        return {
            message: "Update success",
            data: updated
        };
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
                'c.id AS customer_id',
                'MAX(c.email) AS email',
                'MAX(c.phone_number) AS phone',
            ])
            .where('p.project_category = :category', { category })
            .andWhere('p.investor IS NOT NULL')
            .groupBy('p.id, c.id')
            .getRawMany();

        const investorMap = new Map<string, InvestorTemp>();

        for (const row of rows) {

            if (!investorMap.has(row.investor)) {
                investorMap.set(row.investor, {
                    investor: row.investor,
                    quantity: 0,
                    projectMap: new Map<string, ProjectTemp>(),
                });
            }

            const investorItem = investorMap.get(row.investor)!;

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

            if (row.customer_id) {
                projectItem.customerSet.add(row.customer_id);
            }

            const emails = this.extractEmails(row.email);
            const phones = this.extractPhones(row.phone);

            for (const email of emails) {
                projectItem.emailSet.add(email);
            }

            for (const phone of phones) {
                projectItem.phoneSet.add(phone);
            }
        }

        const result: InvestorSummary[] = [];

        for (const investorItem of investorMap.values()) {

            const projects: ProjectSummary[] = [];

            let totalCustomers = 0;
            let totalEmails = 0;
            let totalPhones = 0;

            for (const projectItem of investorItem.projectMap.values()) {

                const customerCount = projectItem.customerSet.size;
                const emailCount = projectItem.emailSet.size;
                const phoneCount = projectItem.phoneSet.size;

                totalCustomers += customerCount;
                totalEmails += emailCount;
                totalPhones += phoneCount;

                projects.push({
                    project_id: projectItem.project_id,
                    project_name: projectItem.project_name,
                    quantity: customerCount,
                    email_quantity: emailCount,
                    phone_quantity: phoneCount,
                });
            }

            result.push({
                investor: investorItem.investor,
                quantity: investorItem.quantity,
                totalCustomers: totalCustomers,
                totalEmails: totalEmails,
                totalPhones: totalPhones,
                list: projects,
            });
        }

        return result;
    }

    async getCustomersByProject(projectId: string) {
        const rows = await this.dataSource
            .createQueryBuilder()
            .from('projects', 'p')
            .leftJoin('project_details', 'd', 'd.project_id = p.id')
            .leftJoin('project_new_sales', 'ns', 'ns.project_detail_id = d.id')
            .leftJoin('customers', 'c', 'c.id = ns.customerId')
            .select([
                'c.id AS customer_id',
                'c.customer_name AS customer_name',
                'c.email AS email',
                'c.phone_number AS phone',
                'c.address AS address',
                'COUNT(ns.id) AS total_units'
            ])
            .where('p.id = :projectId', { projectId })
            .andWhere('c.id IS NOT NULL')
            .groupBy('c.id')
            .addGroupBy('c.customer_name')
            .addGroupBy('c.phone_number')
            .addGroupBy('c.address')
            .orderBy('total_units', 'DESC')
            .getRawMany();

        console.log('SL:', rows.length)

        return rows.map(r => ({
            customer_id: r.customer_id,
            customer_name: r.customer_name,
            email: r.email,
            phone: r.phone,
            address: r.address,
            total_units: Number(r.total_units),
        }));

    }

    async updateProjectDetail(id: string, body: any) {
        const repo = this.dataSource.getRepository(ProjectDetail);

        const detail = await repo.findOne({ where: { id } });
        if (!detail) throw new Error("Project detail not found");

        const allowedFields = [
            "unit_code",
            "product_type",
            "subdivision",
            "floor",
            "land_area",
            "usable_area",
            "door_direction",
            "view",
            "contract_price",
            "day_trading",
            "source",
            "source_details",
            "is_active"
        ];

        const payload: any = {};

        for (const key of allowedFields) {
            if (!(key in body)) continue;

            let val = body[key];

            // Chuẩn hóa string
            if (typeof val === "string") val = val.trim();

            // Nếu rỗng/null/undefined → GIỮ GIÁ TRỊ CŨ (không gửi xuống DB)
            if (val === "" || val === null || val === undefined) {
                payload[key] = (detail as any)[key];
                continue;
            }

            // Convert số nếu cần
            if (["land_area", "usable_area", "contract_price"].includes(key)) {
                const num = Number(val);
                if (!Number.isNaN(num)) val = num;
                else val = (detail as any)[key];
            }

            payload[key] = val;
        }

        await repo.update(id, payload);

        return {
            message: "Update success",
            data: { ...detail, ...payload }
        };
    }
}
