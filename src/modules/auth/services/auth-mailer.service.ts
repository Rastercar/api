import { createPwaUrl, parseHandlebarsTemplate } from '../../mail/mailer.utils'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { MasterUser } from '../../user/entities/master-user.entity'
import { SentMessageInfo } from 'nodemailer/lib/smtp-connection'
import { PWA_ROUTE } from '../../../constants/pwa-routes'
import { User } from '../../user/entities/user.entity'
import { MailerService } from '@nestjs-modules/mailer'
import { JwtService } from '@nestjs/jwt'
import { resolve } from 'path'

@Injectable()
export class AuthMailerService {
  constructor(readonly mailerService: MailerService, readonly jwtService: JwtService) {}

  async sendEmailAdressConfirmationEmail(emailAdress: string) {
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

    return { emailSendingStatus: sent, meta: { link: confirmationLink, token } }
  }

  async sendForgotPasswordEmail(user: User | MasterUser, token: string) {
    const templatePath = resolve(__dirname, '..', 'templates', 'reset-password.hbs')

    const resetPasswordLink = createPwaUrl(PWA_ROUTE.REDEFINE_PASSWORD, { token })

    const sent: SentMessageInfo = await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperação de senha',
      text: 'Link e instruções para recuperação de senha na rastercar',
      html: parseHandlebarsTemplate(templatePath, { resetPasswordLink, helpUrl: PWA_ROUTE.HELP, username: user.username })
    })

    if (sent.rejected.length > 0) {
      throw new UnprocessableEntityException(`Failed to send email to: ${user.email}`)
    }

    return { emailSendingStatus: sent, meta: { link: resetPasswordLink, token } }
  }
}
