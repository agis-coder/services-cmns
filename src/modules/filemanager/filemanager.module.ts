import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileManagerController } from './filemanager.controller';
import { FileManagerService } from './filemanager.service';
import { ImportFile } from '../../entities/import-file.entity';



@Module({
    imports: [
        TypeOrmModule.forFeature([ImportFile]),
    ],
    controllers: [FileManagerController],
    providers: [FileManagerService],
    exports: [FileManagerService],
})
export class FileManagerModule { }
