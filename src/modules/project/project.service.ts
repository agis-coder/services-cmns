import { Injectable, NotFoundException } from "@nestjs/common";
import { Project } from "../../database/entity/project.entity";
import { DataSource } from "typeorm";
import { ProjectCategory } from "../../common/enums/project-category";

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

    async getInvestorsByCategory(category: ProjectCategory) {
        console.log('category:', category)
        const rows = await this.dataSource
            .createQueryBuilder()
            .from('projects', 'p')
            .leftJoin(
                'project_details',
                'd',
                'd.project_id = p.id'
            )
            .select([
                'p.investor AS investor',
                'p.id AS project_id',
                'p.project_name AS project_name',
                'COUNT(d.id) AS quantity',
            ])
            .where('p.project_category = :category', { category })
            .andWhere('p.investor IS NOT NULL')
            .groupBy('p.investor')
            .addGroupBy('p.id')
            .getRawMany();


        const result = new Map<string, any>();

        for (const row of rows) {
            const projectQty = Number(row.quantity);

            if (!result.has(row.investor)) {
                result.set(row.investor, {
                    investor: row.investor,
                    quantity: 0,
                    list: [],
                });
            }

            const investorItem = result.get(row.investor);

            investorItem.list.push({
                project_id: row.project_id,
                project_name: row.project_name,
                quantity: projectQty,
            });

            investorItem.quantity += projectQty;
        }

        return Array.from(result.values());
    }
}
