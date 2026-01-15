// src/modules/import-file/import-file.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportFile } from '../../database/entity/import-file.entity';
import { FileManagerController } from './filemanager.controller';
import { FileManagerService } from './filemanager.service';



@Module({
    imports: [
        TypeOrmModule.forFeature([
            ImportFile,
        ]),
    ],
    controllers: [FileManagerController],
    providers: [FileManagerService],
    exports: [FileManagerService], // nếu module khác cần dùng
})
export class FileManagerModule { }
