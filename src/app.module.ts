


import { Module } from '@nestjs/common';
import { MySQLModule } from './database/mysql';
import { CustomerModule } from './modules/customer/customer.module';
import { ImportModule } from './modules/imports/import.module';
import { ToolsModule } from './modules/tools/tools.module';
import { MailModule } from './modules/mails/mail.module';
import { ProjectModule } from './modules/project/project.module';
import { FileManagerModule } from './modules/filemanager/filemanager.module';
import { PhoneModule } from './modules/phonemanager/phone.module';
import { EmailModule } from './modules/phonemanager/email.module';
import { ZaloModule } from './modules/phonemanager/zalo.module';
import { DeviceModule } from './modules/phonemanager/device.module';
import { FacebookModule } from './modules/phonemanager/facebook.module';

@Module({
    imports: [
        MySQLModule,
        CustomerModule,
        ImportModule,
        ToolsModule,
        MailModule,
        ProjectModule,
        FileManagerModule,
        DeviceModule,
        PhoneModule,
        EmailModule,
        FacebookModule,
        ZaloModule,
    ],
})
export class AppModule { }
