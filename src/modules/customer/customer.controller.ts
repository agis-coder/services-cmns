import { Controller, Get, Query, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    async getAll(
        @Query('page') page = 1,
        @Query('pageSize') pageSize = 30,
        @Query('search') search?: string,
        @Query('source') source?: string,
        @Query('projectId') projectId?: string,
        @Query('country') country?: 'vn' | 'nn',
        @Query('birthday') birthday?: 'today' | 'tomorrow',
        @Query('sortByPurchase') sortByPurchase?: 'most' | 'least',
    ) {
        return this.customerService.findAllWithProjects(
            Number(page),
            Number(pageSize),
            search,
            source,
            projectId,
            country,
            birthday,
            sortByPurchase
        );
    }

    @Get('/projects-by-source')
    async getSources() {
        return this.customerService.getAllSources();
    }

    @Get('/projects-by-investor')
    async getProjectsByInvestor(@Query('investor') investor?: string): Promise<string[]> {
        console.log('investor:', investor)
        return this.customerService.getProjectsByInvestor(investor);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get full customer detail by ID', description: 'Lấy toàn bộ thông tin customer + relatives + dự án mua/bán/chuyển nhượng', })
    @ApiParam({ name: 'id', type: String, description: 'Customer UUID', example: 'c5db02b1-d233-4158-bfc0-531a96832c3c', })
    @ApiResponse({ status: 200, description: 'Customer detail', })
    @ApiResponse({ status: 404, description: 'Customer not found', })
    async getCustomerDetail(@Param('id', new ParseUUIDPipe()) id: string,) {
        return this.customerService.getCustomerDetail(id);
    }

    @Get(':customerId/projects/:projectId/units')
    async getCustomerProjectUnits(
        @Param('customerId') customerId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.customerService.getCustomerProjectUnits(customerId, projectId);
    }
}
