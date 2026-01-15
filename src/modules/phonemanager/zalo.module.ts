import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { ZaloEntity } from '../../database/entity/zalo.entity';
import { ZaloController } from './zalo.controller';
import { ZaloService } from './zalo.service';


@Module({
    imports: [TypeOrmModule.forFeature([ZaloEntity, DeviceEntity])],
    controllers: [ZaloController],
    providers: [ZaloService],
})
export class ZaloModule { }
