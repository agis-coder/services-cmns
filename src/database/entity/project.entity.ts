import { ProjectCategory } from '../../common/enums/project-category';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, } from 'typeorm';
import { ProjectDetail } from './project-detail.entity';

@Entity('projects')
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

