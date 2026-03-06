


import { Module } from '@nestjs/common';
import { MySQLModule } from './database/mysql';
import { CustomerModule } from './modules/customer/customer.module';
import { ImportModule } from './modules/imports/import.module';
import { ToolsModule } from './modules/tools/tools.module';
import { MailModule } from './modules/mails/mail.module';
import { ProjectModule } from './modules/project/project.module';
import { FileManagerModule } from './modules/filemanager/filemanager.module';
import { CacheModule } from './modules/caches/cache.module';

@Module({
    imports: [
        MySQLModule,
        CustomerModule,
        ImportModule,
        ToolsModule,
        MailModule,
        ProjectModule,
        FileManagerModule,
        CacheModule
    ],
})
export class AppModule { }
