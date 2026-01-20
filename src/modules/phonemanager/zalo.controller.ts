import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ZaloService } from './zalo.service';

@ApiTags('Zalo')
@Controller('zalos')
export class ZaloController {
    constructor(private readonly service: ZaloService) { }

    @Post(':deviceId')
    @ApiOperation({ summary: 'Thêm tài khoản Zalo cho thiết bị' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tenZalo: { type: 'string', example: 'Zalo Marketing' },
                sdtDangKy: { type: 'string', example: '0987654321' },
                password: {
                    type: 'string',
                    example: '12345678',
                    nullable: true,
                },
                trangThai: {
                    type: 'string',
                    enum: ['ACTIVE', 'LOCK', 'DIE'],
                    example: 'ACTIVE',
                },
                chayAkaabiz: { type: 'boolean', example: true },
                biKhoa: {
                    type: 'boolean',
                    example: false,
                    description: 'Acc có đang bị khóa hay không',
                },
                chanNhanTinNguoiLa: {
                    type: 'boolean',
                    example: false,
                    description: 'Có bị chặn nhắn tin người lạ hay không',
                },
            },
            required: ['tenZalo', 'sdtDangKy', 'password'],
        },
    })
    create(@Param('deviceId') deviceId: number, @Body() body: any) {
        return this.service.create(+deviceId, body);
    }


    @Get()
    @ApiOperation({ summary: 'Danh sách tất cả Zalo' })
    findAll() {
        return this.service.findAll();
    }

    @Get('device/:deviceId')
    @ApiOperation({ summary: 'Danh sách Zalo theo thiết bị' })
    findByDevice(@Param('deviceId') deviceId: number) {
        return this.service.findByDevice(+deviceId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật Zalo (bao gồm trạng thái khóa & chặn nhắn người lạ)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tenZalo: { type: 'string', example: 'Zalo CSKH' },
                trangThai: {
                    type: 'string',
                    enum: ['ACTIVE', 'LOCK', 'DIE'],
                    example: 'ACTIVE',
                },
                chayAkaabiz: { type: 'boolean', example: false },
                biKhoa: {
                    type: 'boolean',
                    example: true,
                    description: 'true = đang bị khóa',
                },
                chanNhanTinNguoiLa: {
                    type: 'boolean',
                    example: true,
                    description: 'true = bị chặn nhắn tin người lạ',
                },
            },
        },
    })
    update(@Param('id') id: number, @Body() body: any) {
        return this.service.update(+id, body);
    }


    @Delete(':id')
    @ApiOperation({ summary: 'Xoá tài khoản Zalo' })
    remove(@Param('id') id: number) {
        return this.service.remove(+id);
    }
}
