export interface SendBulkMailDto {
    to: string[]
    cc?: string[]
    bcc?: string[]

    subject: string

    htmlContent?: string
    textContent?: string

    attachments?: {
        filename: string
        content: string | Buffer
        contentType?: string
    }[]

    type?: string

    replyTo?: string
    fromName?: string
    fromEmail?: string
}
