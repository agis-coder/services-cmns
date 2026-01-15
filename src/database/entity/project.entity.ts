import { ProjectCategory } from '../../common/enums/project-category';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { ProjectDetail } from './project-detail.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    project_name: string; // VINHOMES GRAND PARK

    @Column({
        type: 'enum',
        enum: ProjectCategory,
        default: ProjectCategory.BDS, // ✅ an toàn khi import
    })
    project_category: ProjectCategory;

    @Column({ nullable: true }) // 🔥 FIX QUAN TRỌNG
    investor: string; // Chủ đầu tư

    @Column({ nullable: true })
    location: string; // Địa chỉ dự án

    @Column({ nullable: true })
    legal: string; // Pháp lý chung

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => ProjectDetail, (d) => d.project)
    details: ProjectDetail[];
}


const data = [
    {
        investor: 'VINHOME',
        quantity: 10,
        list: [
            {
                project_name: 'project_name',
                quantity: 3
            },
            {
                project_name: 'project_name',
                quantity: 3
            },
            {
                project_name: 'project_name',
                quantity: 3
            }
        ]
    }
]