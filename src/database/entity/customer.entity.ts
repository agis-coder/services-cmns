import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, Index } from 'typeorm';
import { RelativeCustomer } from './relative-customer.entity';
import { ProjectTransfer } from './project-transfer.entity';
import { ProjectNewSale } from './project-new-sale.entity';
import { ImportFile } from './import-file.entity';

@Entity('customers')
@Index(['phone_number'])
@Index(['cccd'])
@Index(['customer_name'])
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customer_name: string;

    @Column()
    phone_number: string;

    @Column({ nullable: true })
    img_customer: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;

    @Column({ nullable: true })
    cccd: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    permanent_address: string;

    @Column({ nullable: true })
    living_area: string;

    @Column({ nullable: true })
    the_product_type: string;

    @Column({ nullable: true })
    nationality: string;

    @Column({ nullable: true })
    marital_status: string;

    @Column({ nullable: true })
    interest: string;

    @Column('bigint', { nullable: true })
    total_assets: number;

    @Column({ nullable: true })
    business_field: string;

    @Column({ nullable: true })
    zalo_status: string;

    @Column({ nullable: true })
    facebook: string;

    @ManyToMany(() => RelativeCustomer, (r) => r.customers, {
        cascade: ['insert', 'update'], // ✅ FIX
    })
    @JoinTable({
        name: 'customer_relatives',
        joinColumn: { name: 'customer_id' },
        inverseJoinColumn: { name: 'relative_id' },
    })
    relatives: RelativeCustomer[];

    @OneToMany(() => ProjectTransfer, (t) => t.customer)
    transfers: ProjectTransfer[];

    @OneToMany(() => ProjectNewSale, (n) => n.customer)
    new_sales: ProjectNewSale[];

    @ManyToOne(() => ImportFile, { nullable: true, onDelete: 'CASCADE' })
    import_file: ImportFile;
}

