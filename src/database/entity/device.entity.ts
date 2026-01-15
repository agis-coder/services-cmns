// src/entities/device.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';
import { PhoneEntity } from './phone.entity';
import { EmailEntity } from './email.entity';
import { ZaloEntity } from './zalo.entity';
import { FacebookEntity } from './facebook.entity';

@Entity('devices')
export class DeviceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    tenThietBi: string;

    @OneToMany(() => PhoneEntity, (p) => p.device)
    phones: PhoneEntity[];

    @OneToMany(() => EmailEntity, (e) => e.device)
    emails: EmailEntity[];

    @OneToMany(() => ZaloEntity, (z) => z.device)
    zalos: ZaloEntity[];


    @OneToMany(() => FacebookEntity, (fb) => fb.device)
    fbs: FacebookEntity[];


    @CreateDateColumn()
    createdAt: Date;
}
