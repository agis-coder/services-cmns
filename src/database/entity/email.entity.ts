// email.entity.ts
import {
    Entity,
    Column,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('emails')
export class EmailEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    // ❗ password dạng string, KHÔNG hash
    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ default: false })
    verified: boolean;

    @ManyToOne(() => DeviceEntity, (device) => device.emails, {
        onDelete: 'CASCADE',
    })
    device: DeviceEntity;

    @CreateDateColumn()
    createdAt: Date;
}
