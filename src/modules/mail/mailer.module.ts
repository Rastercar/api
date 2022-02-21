import { MailerModule as MailModule } from '@nestjs-modules/mailer'
import { mailerConfigFactory } from './mailer.config'
import { Module } from '@nestjs/common'

@Module({
  imports: [MailModule.forRootAsync({ useFactory: mailerConfigFactory })]
})
export class MailerModule {}
