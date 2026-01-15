import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { FacebookEntity } from '../../database/entity/facebook.entity';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';


@Module({
    imports: [TypeOrmModule.forFeature([FacebookEntity, DeviceEntity])],
    controllers: [FacebookController],
    providers: [FacebookService],
})
export class FacebookModule { }
