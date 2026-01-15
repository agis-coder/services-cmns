import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entity/project.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Project])],
    controllers: [ProjectController],
    providers: [ProjectService],
})
export class ProjectModule { }
