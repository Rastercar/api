import { MailerOptions } from '@nestjs-modules/mailer'

export const mailerConfigFactory = async (): Promise<MailerOptions> => ({
  transport: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  },

  defaults: {
    from: `Rastercar <${process.env.NO_REPLY_EMAIL}>`
  }
})
