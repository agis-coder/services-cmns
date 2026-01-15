import {
    Controller,
    Delete,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Import')
@Controller('imports')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('excel/new-sale')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    importNewSale(@UploadedFile() file: Express.Multer.File) {
        return this.importService.importNewSaleExcel(file);
    }

    @Post('excel/transfer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    importTransfer(@UploadedFile() file: Express.Multer.File) {
        return this.importService.importTransferExcel(file);
    }

    @Delete(':id')
    deleteImport(@Param('id') id: string) {
        return this.importService.deleteImportFile(id);
    }
}
