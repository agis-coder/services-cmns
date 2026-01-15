import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('relatives_customer')
export class RelativeCustomer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name_of_relative: string;

    @Column()
    phone_number_relative: string;

    @Column({ nullable: true })
    relationship: string;

    @Column({ nullable: true })
    date_of_birth_of_a_relative: string;

    @Column({ nullable: true })
    note_relative: string;

    @ManyToMany(() => Customer, (customer) => customer.relatives)
    customers: Customer[];
}
