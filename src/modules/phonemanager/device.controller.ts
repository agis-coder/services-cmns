// device.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';

@ApiTags('Device')
@Controller('devices')
export class DeviceController {
    constructor(private readonly service: DeviceService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo thiết bị' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tenThietBi: { type: 'string', example: 'MÁY SỐ 1' },
            },
        },
    })
    create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách thiết bị + search (phone/email/zalo/fb)' })
    @ApiQuery({ name: 'sdt', required: false })
    @ApiQuery({ name: 'tenThietBi', required: false })
    @ApiQuery({ name: 'tenZalo', required: false })
    findAll(
        @Query('sdt') sdt?: string,
        @Query('tenThietBi') tenThietBi?: string,
        @Query('tenZalo') tenZalo?: string,
    ) {
        return this.service.findAll({
            sdt,
            tenThietBi,
            tenZalo,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() body: any) {
        return this.service.update(+id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.service.remove(+id);
    }
}
