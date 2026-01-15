import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

export enum FacebookStatus {
    ACTIVE = 'ACTIVE',
    LOCK = 'LOCK',
    DIE = 'DIE',
}

@Entity('facebooks')
export class FacebookEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tenFacebook: string;

    @Column({ nullable: true })
    uid: string;

    @Column()
    email: string;

    @Column()
    password: string; // ❗ plain text

    @Column({
        type: 'enum',
        enum: FacebookStatus,
        default: FacebookStatus.ACTIVE,
    })
    trangThai: FacebookStatus;

    @Column({ default: false })
    chayTool: boolean;

    @ManyToOne(() => DeviceEntity, (device) => device.fbs, {
        onDelete: 'CASCADE',
    })
    device: DeviceEntity;

    @CreateDateColumn()
    createdAt: Date;
}
