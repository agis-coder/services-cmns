import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { ZaloEntity } from '../../database/entity/zalo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ZaloService {
    constructor(
        @InjectRepository(ZaloEntity)
        private readonly repo: Repository<ZaloEntity>,

        @InjectRepository(DeviceEntity)
        private readonly deviceRepo: Repository<DeviceEntity>,
    ) { }

    async create(deviceId: number, body: any) {
        const device = await this.deviceRepo.findOneBy({ id: deviceId });
        if (!device) throw new NotFoundException('Device not found');

        const zalo = this.repo.create({
            tenZalo: body.tenZalo,
            sdtDangKy: body.sdtDangKy,
            trangThai: body.trangThai,
            chayAkaabiz: body.chayAkaabiz ?? false,
            biKhoa: body.biKhoa ?? false,
            device,
        });

        return this.repo.save(zalo);
    }

    findAll() {
        return this.repo.find({
            relations: ['device'],
        });
    }

    findByDevice(deviceId: number) {
        return this.repo.find({
            where: { device: { id: deviceId } },
            relations: ['device'],
        });
    }

    async update(id: number, body: any) {
        const zalo = await this.repo.findOneBy({ id });
        if (!zalo) throw new NotFoundException('Zalo not found');

        Object.assign(zalo, {
            tenZalo: body.tenZalo ?? zalo.tenZalo,
            trangThai: body.trangThai ?? zalo.trangThai,
            chayAkaabiz: body.chayAkaabiz ?? zalo.chayAkaabiz,
            biKhoa: body.biKhoa ?? zalo.biKhoa,
        });

        return this.repo.save(zalo);
    }

    async remove(id: number) {
        const zalo = await this.repo.findOneBy({ id });
        if (!zalo) throw new NotFoundException('Zalo not found');

        return this.repo.remove(zalo);
    }
}
