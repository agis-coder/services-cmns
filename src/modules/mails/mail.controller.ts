import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger'
import { MailService } from './mail.service'
import { type SendBulkMailDto } from '../../common/dto/sendmail'

@ApiTags('Mail')
@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post('send')
    @ApiOperation({ summary: 'Gửi email hàng loạt (React-Quill HTML)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                to: {
                    type: 'array',
                    items: { type: 'string', example: 'test@gmail.com' },
                },
                cc: {
                    type: 'array',
                    items: { type: 'string', example: 'cc@gmail.com' },
                },
                bcc: {
                    type: 'array',
                    items: { type: 'string', example: 'bcc@gmail.com' },
                },
                subject: {
                    type: 'string',
                    example: 'Thông báo hệ thống',
                },
                htmlContent: {
                    type: 'string',
                    example:
                        '<h2>Xin chào</h2><p>Email được gửi từ <b>React-Quill</b></p>',
                },
                textContent: {
                    type: 'string',
                    example: 'Xin chào, đây là email text fallback',
                },
                replyTo: {
                    type: 'string',
                    example: 'support@yourdomain.com',
                },
                fromName: {
                    type: 'string',
                    example: 'Hệ thống CRM',
                },
                fromEmail: {
                    type: 'string',
                    example: 'noreply@yourdomain.com',
                },
                attachments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            filename: {
                                type: 'string',
                                example: 'test.pdf',
                            },
                            content: {
                                type: 'string',
                                example: 'BASE64_ENCODED_STRING',
                            },
                            contentType: {
                                type: 'string',
                                example: 'application/pdf',
                            },
                        },
                    },
                },
                type: {
                    type: 'string',
                    example: 'marketing',
                },
            },
            required: ['subject'],
        },
    })
    send(@Body() body: SendBulkMailDto) {
        return this.mailService.sendBulkMail(body)
    }
}
