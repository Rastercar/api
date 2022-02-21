import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { SentMessageInfo } from 'nodemailer/lib/smtp-connection'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class AuthMailerService {
  constructor(readonly mailerService: MailerService) {}

  /**
   * @throws {UnprocessableEntityException} On mail sending failure
   */
  async sendEmailAdressConfirmationEmail(emailAdress: string): Promise<SentMessageInfo> {
    const sent: SentMessageInfo = await this.mailerService.sendMail({
      to: emailAdress,
      subject: 'testexd !',
      text: 'Teste'
    })

    if (sent.rejected.length > 0) {
      throw new UnprocessableEntityException(`Failed to send email to: ${emailAdress}`)
    }

    return sent
  }
}
