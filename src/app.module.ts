
import { Module } from '@nestjs/common';
import { CustomerModule } from './modules/customer/customer.module';
import { ImportModule } from './modules/imports/import.module';
import { ToolsModule } from './modules/tools/tools.module';
import { MailModule } from './modules/mails/mail.module';
import { ProjectModule } from './modules/project/project.module';
import { FileManagerModule } from './modules/filemanager/filemanager.module';
import { DatabaseModule } from './database/database.module';
import * as redisStore from 'cache-manager-redis-store'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
    imports: [

        RedisModule.forRoot({
            type: 'single',
            url: 'redis://127.0.0.1:6379',
        }),
        DatabaseModule,
        CustomerModule,
        ImportModule,
        ToolsModule,
        MailModule,
        ProjectModule,
        FileManagerModule,
    ],
})
export class AppModule { }
