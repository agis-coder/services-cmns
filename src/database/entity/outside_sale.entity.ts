
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProjectTransfer } from './project-transfer.entity';
import { ProjectNewSale } from './project-new-sale.entity';

@Entity('outside_sales')
export class OutsideSale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    dealer_name: string; // Tên đại lý (bắt buộc)

    @Column()
    outside_sales_name: string; // Tên sale ngoài (bắt buộc)

    @Column()
    phone_sale: string; // SĐT sale ngoài (bắt buộc)

    @Column()
    email_sale: string; // Email sale ngoài (bắt buộc)

    @OneToMany(() => ProjectTransfer, (t) => t.outside_sale)
    transfers: ProjectTransfer[];

    @OneToMany(() => ProjectNewSale, (n) => n.outside_sale)
    new_sales: ProjectNewSale[];

}
