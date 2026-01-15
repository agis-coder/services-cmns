import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../database/entity/device.entity';
import { EmailEntity } from '../../database/entity/email.entity';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';


@Module({
    imports: [TypeOrmModule.forFeature([EmailEntity, DeviceEntity])],
    controllers: [EmailController],
    providers: [EmailService],
})
export class EmailModule { }
