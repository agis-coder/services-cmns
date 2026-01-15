// phone.entity.ts
import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('phones')
export class PhoneEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 20 })
    sdt: string;

    @Column({ length: 50 })
    nhaMang: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    soTien: number;

    @ManyToOne(() => DeviceEntity, (device) => device.phones, {
        onDelete: 'CASCADE',
    })
    device: DeviceEntity;

    @CreateDateColumn()
    createdAt: Date;
}
