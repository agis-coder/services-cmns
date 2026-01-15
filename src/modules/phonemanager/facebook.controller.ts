import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FacebookService } from './facebook.service';

@ApiTags('Facebook')
@Controller('facebooks')
export class FacebookController {
    constructor(private readonly service: FacebookService) { }

    @Post(':deviceId')
    @ApiOperation({ summary: 'Thêm Facebook cho thiết bị' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tenFacebook: { example: 'FB Marketing' },
                uid: { example: '1000xxxxxxxx' },
                email: { example: 'fb@gmail.com' },
                password: { example: 'fbpass123' },
                trangThai: {
                    type: 'string',
                    enum: ['ACTIVE', 'LOCK', 'DIE'],
                    example: 'ACTIVE',
                },
                chayTool: { example: true },
            },
            required: ['tenFacebook', 'email', 'password'],
        },
    })
    create(@Param('deviceId') id: number, @Body() body: any) {
        return this.service.create(+id, body);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách Facebook' })
    findAll() {
        return this.service.findAll();
    }

    @Get('device/:deviceId')
    @ApiOperation({ summary: 'Facebook theo thiết bị' })
    findByDevice(@Param('deviceId') id: number) {
        return this.service.findByDevice(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật Facebook' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tenFacebook: { example: 'FB Ads' },
                password: { example: 'newpass' },
                trangThai: { example: 'LOCK' },
                chayTool: { example: false },
            },
        },
    })
    update(@Param('id') id: number, @Body() body: any) {
        return this.service.update(+id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xoá Facebook' })
    remove(@Param('id') id: number) {
        return this.service.remove(+id);
    }
}
