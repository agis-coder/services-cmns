// src/database/entity/import-file.entity.ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { ProjectNewSale } from './project-new-sale.entity';
import { ProjectTransfer } from './project-transfer.entity';

export enum ImportStatus {
    IMPORTED = 'imported',
    TEMP_DELETED = 'temp_deleted',
}

@Entity('import_files')
export class ImportFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    file_name: string;

    @Column({
        type: 'enum',
        enum: ImportStatus,
        default: ImportStatus.IMPORTED,
    })
    status: ImportStatus;

    @CreateDateColumn()
    imported_at: Date;

    @OneToMany(() => Customer, (c) => c.import_file)
    customers: Customer[];

    @OneToMany(() => ProjectNewSale, (n) => n.import_file)
    new_sales: ProjectNewSale[];

    @OneToMany(() => ProjectTransfer, (t) => t.import_file)
    transfers: ProjectTransfer[];
}
