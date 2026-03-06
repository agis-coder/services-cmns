import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, } from 'typeorm';
import { Project } from './project.entity';
import { ProjectTransfer } from './project-transfer.entity';
import { ProjectNewSale } from './project-new-sale.entity';

@Entity('project_details')
export class ProjectDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ManyToOne(() => Project, (p) => p.details, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;
    @Column()
    unit_code: string;
    @Column()
    product_type: string;
    @Column()
    subdivision: string;
    @Column()
    floor: string;
    @Column('decimal', { precision: 18, scale: 2 })
    land_area: number;
    @Column('decimal', { precision: 18, scale: 2 })
    usable_area: number;
    @Column()
    door_direction: string;
    @Column()
    view: string;
    @Column('bigint')
    contract_price: number;
    @Column({ nullable: true })
    day_trading: string;
    @Column()
    source: string;
    @Column({ nullable: true })
    source_details: string;
    @Column({ default: true })
    is_active: boolean;
    @OneToMany(() => ProjectNewSale, (n) => n.project_detail)
    new_sales: ProjectNewSale[];
    @OneToMany(() => ProjectTransfer, (t) => t.project_detail)
    transfers: ProjectTransfer[];
}
