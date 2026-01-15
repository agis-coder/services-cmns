import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ApiTags, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { Project } from "../../database/entity/project.entity";
import { ProjectCategory } from "../../common/enums/project-category";

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
    async getInvestors(@Query('category') category: ProjectCategory) {
        console.log('category:', category)
        return this.projectService.getInvestorsByCategory(category);
    }

    @Get()
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "pageSize", required: false, type: Number })
    @ApiQuery({ name: "search", required: false, type: String })
    async getProjects(
        @Query("page") page?: number,
        @Query("pageSize") pageSize?: number,
        @Query("search") search?: string
    ) {
        return this.projectService.getProjects(page, pageSize, search);
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

    @Put(":id")
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: Project })
    async updateProject(@Param("id") id: string, @Body() payload: Partial<Project>) {
        return this.projectService.updateProject(id, payload);
    }

    @Delete(":id")
    @ApiParam({ name: "id", type: String })
    async deleteProject(@Param("id") id: string) {
        return this.projectService.deleteProject(id);
    }


}
