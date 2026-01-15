import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { PhoneEntity } from '../../database/entity/phone.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PhoneService {
    constructor(
        @InjectRepository(PhoneEntity)
        private phoneRepo: Repository<PhoneEntity>,

        @InjectRepository(DeviceEntity)
        private deviceRepo: Repository<DeviceEntity>,
    ) { }

    async create(deviceId: number, body: any) {
        const device = await this.deviceRepo.findOneBy({ id: deviceId });
        if (!device) throw new NotFoundException('Device not found');

        return this.phoneRepo.save({
            sdt: body.sdt,
            nhaMang: body.nhaMang,
            soTien: body.soTien ?? 0,
            device,
        });
    }

    findAll() {
        return this.phoneRepo.find({ relations: ['device'] });
    }

    findByDevice(deviceId: number) {
        return this.phoneRepo.find({
            where: { device: { id: deviceId } },
            relations: ['device'],
        });
    }

    update(id: number, body: any) {
        return this.phoneRepo.update(id, body);
    }

    remove(id: number) {
        return this.phoneRepo.delete(id);
    }
}
