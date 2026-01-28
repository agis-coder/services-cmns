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
import {
    ApiConsumes,
    ApiBody,
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Import')
@Controller('imports')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('excel/new-sale')
    @ApiOperation({ summary: 'Import Excel New Sale' })
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
    @ApiOperation({ summary: 'Import Excel Transfer' })
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
    @ApiOperation({
        summary: 'Xóa file import và toàn bộ dữ liệu liên quan',
        description:
            'Xóa ImportFile, Customer thuộc file đó, ProjectNewSale / ProjectTransfer và ProjectDetail không còn được sử dụng',
    })
    @ApiParam({
        name: 'id',
        description: 'ID của ImportFile',
        example: 'c1c8c8c4-9c2d-4b5f-9c91-2a8c9f0e1234',
    })
    @ApiResponse({
        status: 200,
        description: 'Xóa thành công',
        schema: {
            example: {
                message: 'Đã xóa toàn bộ dữ liệu của file import',
            },
        },
    })
    deleteImport(@Param('id') id: string) {
        return this.importService.deleteImportFile(id);
    }
}
