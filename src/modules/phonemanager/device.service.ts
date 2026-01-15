// device.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(DeviceEntity)
        private repo: Repository<DeviceEntity>,
    ) { }

    create(body: any) {
        return this.repo.save({
            tenThietBi: body.tenThietBi,
        });
    }

    async findAll(filter?: {
        sdt?: string;
        tenThietBi?: string;
        tenZalo?: string;
    }) {
        const qb = this.repo
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.phones', 'phone')
            .leftJoinAndSelect('device.emails', 'email')
            .leftJoinAndSelect('device.zalos', 'zalo')
            .leftJoinAndSelect('device.fbs', 'fb');

        if (filter?.sdt) {
            qb.andWhere(
                `phone.sdt LIKE :sdt 
                 OR zalo.sdtDangKy LIKE :sdt`,
                { sdt: `%${filter.sdt}%` },
            );
        }

        if (filter?.tenThietBi) {
            qb.andWhere(
                'device.tenThietBi LIKE :tenThietBi',
                { tenThietBi: `%${filter.tenThietBi}%` },
            );
        }

        if (filter?.tenZalo) {
            qb.andWhere(
                'zalo.tenZalo LIKE :tenZalo',
                { tenZalo: `%${filter.tenZalo}%` },
            );
        }

        return qb.getMany();
    }

    async findOne(id: number) {
        const device = await this.repo.findOne({
            where: { id },
            relations: ['phones', 'emails', 'zalos'],
        });

        if (!device) throw new NotFoundException('Device not found');
        return device;
    }

    update(id: number, body: any) {
        return this.repo.update(id, body);
    }

    async remove(id: number) {
        const device = await this.repo.findOneBy({ id });
        if (!device) throw new NotFoundException('Device not found');

        return this.repo.delete(id);
    }
}
