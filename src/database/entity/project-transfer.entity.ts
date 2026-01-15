import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Employee } from './emloyee.entity';
import { OutsideSale } from './outside_sale.entity';
import { ImportFile } from './import-file.entity';
import { ProjectDetail } from './project-detail.entity';

@Entity('project_transfers')
export class ProjectTransfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date', nullable: true })
    first_interaction_transfer: Date | null;

    @Column({ type: 'date', nullable: true })
    closest_interaction_transfer: Date | null;

    @Column()
    result_transfer: string;

    @Column('bigint')
    expected_selling_price_transfer: number;

    @Column('bigint')
    expected_rental_price_transfer: number;

    @Column({ nullable: true })
    note_expected_transfer: string;

    @ManyToOne(() => ProjectDetail, (d) => d.transfers, {
        nullable: false,
        onDelete: 'CASCADE', // 🔥 xóa detail → xóa transfer
    })
    @JoinColumn({ name: 'project_detail_id' })
    project_detail: ProjectDetail;

    @ManyToOne(() => Customer, { nullable: false })
    customer: Customer;

    @ManyToOne(() => OutsideSale, { nullable: true })
    outside_sale: OutsideSale | null;

    @ManyToOne(() => Employee, { nullable: true })
    employee: Employee | null;

    @ManyToOne(() => ImportFile, { nullable: true, onDelete: 'CASCADE' })
    import_file: ImportFile;
}
