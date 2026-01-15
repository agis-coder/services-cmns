// zalo.entity.ts
import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

export enum ZaloStatus {
    ACTIVE = 'ACTIVE',
    DIE = 'DIE',
    LOCK = 'LOCK',
}

@Entity('zalos')
export class ZaloEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    tenZalo: string;

    @Column({
        type: 'enum',
        enum: ZaloStatus,
        default: ZaloStatus.ACTIVE,
    })
    trangThai: ZaloStatus;

    @Column({ length: 20 })
    sdtDangKy: string;

    @Column({ length: 100 })
    password: string;

    @Column({ default: false })
    chayAkaabiz: boolean;

    @Column({ default: false })
    biKhoa: boolean;

    @ManyToOne(() => DeviceEntity, (device) => device.zalos, {
        onDelete: 'CASCADE',
    })
    device: DeviceEntity;

    @CreateDateColumn()
    createdAt: Date;
}
