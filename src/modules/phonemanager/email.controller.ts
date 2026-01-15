import { Controller, Post, Get, Delete, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('emails')
export class EmailController {
    constructor(private readonly service: EmailService) { }

    @Post(':deviceId')
    @ApiOperation({ summary: 'Thêm Email cho thiết bị' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { example: 'test@gmail.com' },
                password: { example: '123456' },
                verified: { example: false },
            },
            required: ['email', 'password'],
        },
    })
    create(@Param('deviceId') id: number, @Body() body: any) {
        return this.service.create(+id, body);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách Email' })
    findAll() {
        return this.service.findAll();
    }

    @Get('device/:deviceId')
    @ApiOperation({ summary: 'Email theo thiết bị' })
    findByDevice(@Param('deviceId') id: number) {
        return this.service.findByDevice(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật Email' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { example: 'new@gmail.com' },
                password: { example: 'newpass' },
                verified: { example: true },
            },
        },
    })
    update(@Param('id') id: number, @Body() body: any) {
        return this.service.update(+id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xoá Email' })
    remove(@Param('id') id: number) {
        return this.service.remove(+id);
    }
}
