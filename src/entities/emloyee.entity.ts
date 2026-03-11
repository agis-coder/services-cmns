
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProjectTransfer } from './project-transfer.entity';
import { ProjectNewSale } from './project-new-sale.entity';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code_otp: string;

    @Column()
    empl_id: string;

    @Column()
    empl_name: string;

    @Column()
    empl_phone: string;

    @Column()
    empl_email: string;

    @Column({ nullable: true })
    time_care: string;

    @OneToMany(() => ProjectTransfer, (t) => t.employee)
    transfers: ProjectTransfer[];

    @OneToMany(() => ProjectNewSale, (n) => n.employee)
    new_sales: ProjectNewSale[];

}
