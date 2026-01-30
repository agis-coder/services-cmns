import { Controller, Get, Query, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 100 })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'source', required: false, type: String })
    @ApiQuery({ name: 'subdivision', required: false, type: String })
    @ApiQuery({ name: 'customerName', required: false, type: String })

    @ApiQuery({
        name: 'country',
        required: false,
        enum: ['vn', 'nn'],
    })

    @ApiQuery({
        name: 'birthday',
        required: false,
        enum: ['today', 'tomorrow'],
        description: 'Lọc sinh nhật: hôm nay hoặc ngày mai',
    })

    @ApiQuery({
        name: 'sortByPurchase',
        required: false,
        enum: ['most', 'least'],
        description: 'Sắp xếp theo số lần mua (most = mua nhiều nhất, least = mua ít nhất)',
    })
    async getAll(
        @Query('page') page = 1,
        @Query('pageSize') pageSize = 100,
        @Query('search') search?: string,
        @Query('source') source?: string,
        @Query('subdivision') subdivision?: string,
        @Query('customerName') customerName?: string,
        @Query('country') country?: 'vn' | 'nn',
        @Query('birthday') birthday?: 'today' | 'tomorrow',
        @Query('sortByPurchase') sortByPurchase?: 'most' | 'least',
    ) {
        return this.customerService.findAllWithProjects(
            page,
            pageSize,
            search,
            source,
            subdivision,
            customerName,
            country,
            birthday,
            sortByPurchase,
        );
    }



    @Get('subdivisions-by-source')
    @ApiOperation({ summary: 'Lấy danh sách tên tòa (subdivision) theo source', description: 'Ví dụ: source = BDS → trả về danh sách tên tòa thuộc BDS' })
    @ApiQuery({ name: 'source', required: true, example: 'BDS', })
    async getSubdivisionsBySource(@Query('source') source: string) {
        return {
            source,
            subdivisions: await this.customerService.getSubdivisionsBySource(source),
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get full customer detail by ID', description: 'Lấy toàn bộ thông tin customer + relatives + dự án mua/bán/chuyển nhượng', })
    @ApiParam({ name: 'id', type: String, description: 'Customer UUID', example: 'c5db02b1-d233-4158-bfc0-531a96832c3c', })
    @ApiResponse({ status: 200, description: 'Customer detail', })
    @ApiResponse({ status: 404, description: 'Customer not found', })
    async getCustomerDetail(@Param('id', new ParseUUIDPipe()) id: string,) {
        return this.customerService.getCustomerDetail(id);
    }



}
