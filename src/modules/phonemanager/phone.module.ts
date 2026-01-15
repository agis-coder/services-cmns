import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { PhoneEntity } from '../../database/entity/phone.entity';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';


@Module({
    imports: [TypeOrmModule.forFeature([PhoneEntity, DeviceEntity])],
    controllers: [PhoneController],
    providers: [PhoneService],
})
export class PhoneModule { }
