import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { EmailEntity } from '../../database/entity/email.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
    constructor(
        @InjectRepository(EmailEntity)
        private emailRepo: Repository<EmailEntity>,

        @InjectRepository(DeviceEntity)
        private deviceRepo: Repository<DeviceEntity>,
    ) { }

    async create(deviceId: number, body: any) {
        const device = await this.deviceRepo.findOneBy({ id: deviceId });
        if (!device) throw new NotFoundException('Device not found');

        return this.emailRepo.save({
            email: body.email,
            password: body.password, // ✅ thêm password
            verified: body.verified ?? false,
            device,
        });
    }

    findAll() {
        return this.emailRepo.find({ relations: ['device'] });
    }

    findByDevice(deviceId: number) {
        return this.emailRepo.find({
            where: { device: { id: deviceId } },
            relations: ['device'],
        });
    }

    update(id: number, body: any) {
        return this.emailRepo.update(id, {
            email: body.email,
            password: body.password,
            verified: body.verified,
        });
    }

    remove(id: number) {
        return this.emailRepo.delete(id);
    }
}