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
        if (!file?.buffer) {
            return res.status(400).json({ message: 'Thiếu file upload' });
        }

        // 1️⃣ xử lý file chính
        const { buffer, phones } =
            await this.toolsService.processExcel(file.buffer);

        // 2️⃣ build akabiz
        const akabizBuffer =
            await this.toolsService['buildAkabizExcel'](phones);

        // 3️⃣ zip 2 file lại
        const zip = new (require('jszip'))();

        const baseName = file.originalname.replace(/\.xlsx?$/i, '');

        zip.file(`${baseName}_PHONE.xlsx`, buffer);
        zip.file(`${baseName}_AKABIZ.xlsx`, akabizBuffer);

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // 4️⃣ trả zip
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="convert_phone_result.zip"',
        );

        return res.send(zipBuffer);
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
