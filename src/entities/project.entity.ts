import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index, } from 'typeorm';
import { ProjectDetail } from './project-detail.entity';
import { ProjectCategory } from '../common/enums/project-category';

@Entity('projects')
@Index(['project_name', 'investor'])
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    project_name: string;
    @Column({ type: 'enum', enum: ProjectCategory, default: ProjectCategory.BDS, })
    project_category: ProjectCategory;
    @Column({ nullable: true })
    investor: string;
    @Column({ nullable: true })
    location: string;
    @Column({ nullable: true })
    legal: string;
    @Column({ nullable: true })
    description: string;
    @OneToMany(() => ProjectDetail, (d) => d.project)
    details: ProjectDetail[];
}

