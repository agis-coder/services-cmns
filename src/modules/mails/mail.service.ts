import { Injectable, BadRequestException } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { SendBulkMailDto } from '../../common/dto/sendmail'

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'thongtinduanhot2026@gmail.com', // email gửi
                pass: 'igti zszf eoys weno', // app password
            },
        })
    }

    async sendBulkMail(dto: SendBulkMailDto) {
        const {
            to,
            cc = [],
            bcc = [],
            subject,
            htmlContent,
            textContent,
            attachments,
            replyTo,
            fromName,
            fromEmail,
        } = dto

        if (!subject?.trim()) {
            throw new BadRequestException('Thiếu subject')
        }

        if (!to?.length && !cc.length && !bcc.length) {
            throw new BadRequestException('Phải có ít nhất 1 người nhận')
        }

        if (!htmlContent && !textContent) {
            throw new BadRequestException('Thiếu nội dung email')
        }

        const normalizeEmails = (list: string[]) =>
            [...new Set(list.map(e => e.trim()))]

        const allEmails = normalizeEmails([...to, ...cc, ...bcc])

        const invalidEmails = allEmails.filter(
            e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
        )

        if (invalidEmails.length) {
            throw new BadRequestException(
                `Email không hợp lệ: ${invalidEmails.join(', ')}`,
            )
        }

        const info = await this.transporter.sendMail({
            from: fromEmail
                ? `"${fromName || ''}" <${fromEmail}>`
                : `"THÔNG TIN DỰ ÁN HOT" <${process.env.MAIL_USER}>`,

            to: process.env.MAIL_USER, // hoặc email của bạn để tránh spam filter
            bcc: bcc.length ? bcc : to, // toàn bộ người nhận sẽ nằm ở BCC

            replyTo,
            subject,

            html: htmlContent,
            text: textContent,

            attachments,
        })

        return {
            success: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        }
    }
}
