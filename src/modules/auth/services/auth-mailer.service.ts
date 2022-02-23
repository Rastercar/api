import { createPwaUrl, parseHandlebarsTemplate } from '../../mail/mailer.utils'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { SentMessageInfo } from 'nodemailer/lib/smtp-connection'
import { MailerService } from '@nestjs-modules/mailer'
import { resolve } from 'path'
import { JwtService } from '@nestjs/jwt'
import { PWA_ROUTE } from '../../../constants/pwa-routes'

@Injectable()
export class AuthMailerService {
  constructor(readonly mailerService: MailerService, readonly jwtService: JwtService) {}

  /**
   * @throws {UnprocessableEntityException} On mail sending failure
   */
  async sendEmailAdressConfirmationEmail(emailAdress: string): Promise<SentMessageInfo> {
    const templatePath = resolve(__dirname, '..', 'templates', 'confirm-email.hbs')
    const token = this.jwtService.sign({ sub: emailAdress }, { expiresIn: '10m' })

    const confirmationLink = createPwaUrl(PWA_ROUTE.CONFIRM_EMAIL, { token })

    const sent: SentMessageInfo = await this.mailerService.sendMail({
      to: emailAdress,
      subject: 'Confirmação de email',
      text: 'Clique no botão abaixo para confirmar seu email',
      html: parseHandlebarsTemplate(templatePath, { confirmationLink })
    })

    if (sent.rejected.length > 0) {
      throw new UnprocessableEntityException(`Failed to send email to: ${emailAdress}`)
    }

    return {
      emailSendingStatus: sent,
      confirmation: { link: confirmationLink, token }
    }
  }
}
