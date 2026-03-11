import { Controller, Get, Query } from '@nestjs/common';
import { FileManagerService } from './filemanager.service';
import { ImportStatus } from '../../common/enums/import';

@Controller('filemanager')
export class FileManagerController {
    constructor(private readonly service: FileManagerService) { }

    @Get()
    getList(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: ImportStatus,) {
        return this.service.getList({ page: Number(page), limit: Number(limit), status });
    }
}
