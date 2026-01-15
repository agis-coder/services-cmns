import { Controller, Post, Get, Delete, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PhoneService } from './phone.service';

@ApiTags('Phone')
@Controller('phones')
export class PhoneController {
    constructor(private readonly service: PhoneService) { }

    @Post(':deviceId')
    @ApiOperation({ summary: 'Thêm SĐT cho thiết bị' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                sdt: {
                    type: 'string',
                    example: '0987654321',
                },
                nhaMang: {
                    type: 'string',
                    example: 'Viettel',
                },
                soTien: {
                    type: 'number',
                    example: 50000,
                },
            },
            required: ['sdt', 'nhaMang'],
        },
    })
    create(
        @Param('deviceId') deviceId: number,
        @Body() body: any,
    ) {
        return this.service.create(+deviceId, body);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách tất cả SĐT' })
    findAll() {
        return this.service.findAll();
    }

    @Get('device/:deviceId')
    @ApiOperation({ summary: 'Danh sách SĐT theo thiết bị' })
    findByDevice(@Param('deviceId') deviceId: number) {
        return this.service.findByDevice(+deviceId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật SĐT' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nhaMang: {
                    type: 'string',
                    example: 'Mobifone',
                },
                soTien: {
                    type: 'number',
                    example: 100000,
                },
            },
        },
    })
    update(@Param('id') id: number, @Body() body: any) {
        return this.service.update(+id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xoá SĐT' })
    remove(@Param('id') id: number) {
        return this.service.remove(+id);
    }
}
