import { Controller, Get, Post, Put, Delete, Param, Body, Query, Patch } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ApiTags, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ProjectCategory } from "../../common/enums/project-category";
import { Project } from "../../entities/project.entity";

@ApiTags("Projects")
@Controller("projects")
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Get('investors')
    @ApiOperation({ summary: 'Danh sách chủ đầu tư theo loại dự án', description: `hỉ truyền project_category.` })
    @ApiQuery({
        name: 'category',
        enum: ProjectCategory,
        required: false,
    })
    async getInvestors(@Query('category') category: ProjectCategory): Promise<any> {
        return this.projectService.getInvestorsByCategory(category);
    }

    @Get()
    @ApiQuery({ name: "search", required: false, type: String, description: "Search project name" })
    @ApiQuery({ name: "category", required: false, enum: ProjectCategory })
    @ApiQuery({ name: "investor", required: false, type: String })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "pageSize", required: false, type: Number })
    async getProjects(
        @Query("search") search?: string,
        @Query("category") category?: ProjectCategory,
        @Query("investor") investor?: string,
    ) {
        return this.projectService.getProjects(search, category, investor);
    }

    @Get(":id/customers")
    @ApiOperation({
        summary: "Danh sách khách hàng theo project",
        description: "Lấy danh sách khách hàng đã mua trong dự án theo project_id",
    })
    @ApiParam({
        name: "id",
        type: String,
        description: "Project ID",
    })
    @ApiOkResponse({
        description: "Danh sách khách hàng",
    })
    async getCustomersByProject(@Param("id") id: string) {
        return this.projectService.getCustomersByProject(id);
    }

    @Get(":id")
    @ApiParam({ name: "id", type: String })
    async getProject(@Param("id") id: string) {
        return this.projectService.getProjectById(id);
    }

    @Post()
    @ApiBody({ type: Project })
    async createProject(@Body() payload: Partial<Project>) {
        return this.projectService.createProject(payload);
    }

    @Patch(":id")
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: Project })
    async updateProject(@Param("id") id: string, @Body() payload: Partial<Project>) {
        console.log("UPDATE PROJECT REQUEST");
        console.log("ID:", id);
        console.log("BODY:", JSON.stringify(payload, null, 2));
        return this.projectService.updateProject(id, payload);
    }

    @Patch("/projectDetail/:id")
    @ApiParam({ name: "id", type: String })
    async updateProjectDetail(
        @Param("id") id: string,
        @Body() body: any
    ) {
        console.log("UPDATE PROJECT DETAIL:", id)
        console.log("BODY:", body)

        return this.projectService.updateProjectDetail(id, body);
    }

    @Delete(":id")
    @ApiParam({ name: "id", type: String })
    async deleteProject(@Param("id") id: string) {
        return this.projectService.deleteProject(id);
    }


}
