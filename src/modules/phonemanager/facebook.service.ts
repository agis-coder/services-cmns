import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { FacebookEntity } from '../../database/entity/facebook.entity';
import { Repository } from 'typeorm';


@Injectable()
export class FacebookService {
    constructor(
        @InjectRepository(FacebookEntity)
        private fbRepo: Repository<FacebookEntity>,

        @InjectRepository(DeviceEntity)
        private deviceRepo: Repository<DeviceEntity>,
    ) { }

    async create(deviceId: number, body: any) {
        const device = await this.deviceRepo.findOneBy({ id: deviceId });
        if (!device) throw new NotFoundException('Device not found');

        return this.fbRepo.save({
            tenFacebook: body.tenFacebook,
            uid: body.uid,
            email: body.email,
            password: body.password,
            trangThai: body.trangThai,
            chayTool: body.chayTool ?? false,
            device,
        });
    }

    findAll() {
        return this.fbRepo.find({ relations: ['device'] });
    }

    findByDevice(deviceId: number) {
        return this.fbRepo.find({
            where: { device: { id: deviceId } },
            relations: ['device'],
        });
    }

    update(id: number, body: any) {
        return this.fbRepo.update(id, body);
    }

    remove(id: number) {
        return this.fbRepo.delete(id);
    }
}
