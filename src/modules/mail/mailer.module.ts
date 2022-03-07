import { MailerModule as MailModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'

import { mailerConfigFactory } from './mailer.config'

@Module({
  imports: [MailModule.forRootAsync({ useFactory: mailerConfigFactory })]
})
export class MailerModule {}
