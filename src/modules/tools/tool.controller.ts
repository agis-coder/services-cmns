import { Controller, Post, UploadedFile, UseInterceptors, Res, Body, UploadedFiles, } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { type Response } from 'express'
import { ToolsService } from './tools.service'

import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger'

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
    constructor(private readonly toolsService: ToolsService) { }
    @Post('/convert-phone')
    @UseInterceptors(FileInterceptor('file'))
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
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        if (!file) {
            return res.status(400).json({ message: 'Thiếu file upload' });
        }

        const { buffer, phones } =
            await this.toolsService.processExcel(file.buffer);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="dulieu_clean_oneline.xlsx"',
        );

        return res.send(buffer);
    }

    @ApiTags('Tools')
    @Post('excel/multi')
    @ApiOperation({ summary: 'Upload nhiều file Excel xử lý PHONE' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMultiExcel(
        @UploadedFiles() files: Express.Multer.File[],
        @Res() res: Response,
    ) {
        const zipBuffer = await this.toolsService.processMultipleExcel(files);

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename=PHONE_RESULT.zip',
        });

        res.send(zipBuffer);
    }


}
