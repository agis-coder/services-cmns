import { Module } from '@nestjs/common'
import { ToolsService } from './tools.service'
import { ToolsController } from './tool.controller'

@Module({
    controllers: [ToolsController],
    providers: [ToolsService],
})
export class ToolsModule { }
