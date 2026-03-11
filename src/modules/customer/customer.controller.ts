import { Controller, Get, Query, Param, NotFoundException, ParseUUIDPipe, Patch, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from '../../common/dto/customer.dto';
import { Customer } from '../../entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'pageSize', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'source', required: false })
    @ApiQuery({ name: 'projectId', required: false })
    @ApiQuery({ name: 'country', required: false })
    @ApiQuery({ name: 'birthday', required: false })
    @ApiQuery({ name: 'sortByPurchase', required: false })
    @ApiQuery({ name: 'hasEmail', required: false, enum: ['yes', 'no', 'all'] })
    async getAll(@Query('page') page?: any, @Query('pageSize') pageSize?: any, @Query('search') search?: any, @Query('source') source?: any, @Query('projectId') projectId?: any, @Query('country') country?: any, @Query('birthday') birthday?: any, @Query('sortByPurchase') sortByPurchase?: any, @Query('hasEmail') hasEmail?: 'yes' | 'no' | 'all',
    ) {
        return this.customerService.findAllWithProjects(Number(page) || 1, Number(pageSize) || 30, search, source, projectId, country, birthday, sortByPurchase, hasEmail)
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
    async getCustomerProjectUnits(@Param('customerId') customerId: string, @Param('projectId') projectId: string) {
        return this.customerService.getCustomerProjectUnits(customerId, projectId);
    }

    @Post()
    @ApiOperation({ summary: 'Create new customer' })
    @ApiBody({ type: CreateCustomerDto })
    @ApiResponse({ status: 201, description: 'Customer created successfully', type: Customer })
    @ApiResponse({ status: 400, description: 'Phone number already exists' })
    async create(@Body() dto: CreateCustomerDto): Promise<Customer> {
        return this.customerService.create(dto);
    }

    @Patch(":id")
    @ApiParam({ name: "id", type: String })
    async updateCustomer(@Param("id") id: string, @Body() body: any) {
        return this.customerService.updateCustomer(id, body);
    }
}
