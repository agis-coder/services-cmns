// src/modules/import-file/import-file.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ImportStatus } from '../../database/entity/import-file.entity';
import { FileManagerService } from './filemanager.service';

@Controller('filemanager')
export class FileManagerController {
    constructor(private readonly service: FileManagerService) { }

    @Get()
    getList(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: ImportStatus,
    ) {
        return this.service.getList({
            page: Number(page),
            limit: Number(limit),
            status,
        });
    }
}
