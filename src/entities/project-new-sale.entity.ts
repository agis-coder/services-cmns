import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Customer } from './customer.entity';
import { Employee } from './emloyee.entity';
import { OutsideSale } from './outside_sale.entity';
import { ImportFile } from './import-file.entity';
import { ProjectDetail } from './project-detail.entity';

@Entity('project_new_sales')
export class ProjectNewSale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date', nullable: true })
    first_interaction_new: Date | null;;

    @Column({ type: 'date', nullable: true })
    closest_interaction_new: Date | null;;

    @Column({ nullable: true })
    project_advertised: string;

    @Column({ nullable: true })
    result_new: string;

    @Column({ nullable: true })
    note_expected_new: string;

    @ManyToOne(() => ProjectDetail, (d) => d.new_sales, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_detail_id' })
    project_detail: ProjectDetail;

    @ManyToOne(() => Customer, { nullable: false })
    customer: Customer;

    @ManyToOne(() => OutsideSale, { nullable: true })
    outside_sale: OutsideSale;

    @ManyToOne(() => Employee, { nullable: true })
    employee: Employee;

    @ManyToOne(() => ImportFile, { nullable: true, onDelete: 'CASCADE' })
    import_file: ImportFile;
}

