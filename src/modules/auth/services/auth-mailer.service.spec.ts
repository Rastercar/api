import { createFakeUser } from '../../../database/seeders/user.seeder'
import { UnprocessableEntityException } from '@nestjs/common'
import { AuthMailerService } from './auth-mailer.service'
import { MailerService } from '@nestjs-modules/mailer'
import { User } from '../../user/entities/user.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { faker } from '@mikro-orm/seeder'

describe('AuthMailerService', () => {
  let authMailerService: AuthMailerService
  let mailerService: MailerService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMailerService,
        {
          provide: MailerService,
          useFactory: () => ({ sendMail: jest.fn() })
        },
        {
          provide: JwtService,
          useFactory: () => ({ sign: jest.fn(), decode: jest.fn(), verifyAsync: jest.fn() })
        }
      ]
    }).compile()

    jwtService = module.get(JwtService)
    mailerService = module.get(MailerService)
    authMailerService = module.get(AuthMailerService)
  })

  it('should be defined', () => {
    expect(jwtService).toBeDefined()
    expect(mailerService).toBeDefined()
    expect(authMailerService).toBeDefined()
  })

  describe('[sendEmailAdressConfirmationEmail]', () => {
    it('sends the email to the provided adress with the correct template', async () => {
      const token = 'imatoken'
      const sentStatusMock = { accepted: [], rejected: [] }
      const email = 'some.email@gmail.com'

      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => sentStatusMock)
      jest.spyOn(jwtService, 'sign').mockImplementationOnce(() => token)

      const sent = await authMailerService.sendEmailAdressConfirmationEmail(email)

      expect(mailerService.sendMail).toHaveBeenLastCalledWith({
        to: email,
        text: expect.anything(),
        html: expect.anything(),
        subject: expect.anything()
      })
      expect(typeof sent.meta.link).toBe('string')
      expect(sent.meta.token).toBe(token)
      expect(sent.emailSendingStatus).toBe(sentStatusMock)
    })

    it('Fails with UnprocessableEntityException on email sending failure', async () => {
      const email = 'some.email@gmail.com'
      const sentStatusMock = { accepted: [], rejected: [email] }

      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => sentStatusMock)

      await expect(authMailerService.sendEmailAdressConfirmationEmail(email)).rejects.toThrow(UnprocessableEntityException)
    })
  })

  describe('[sendForgotPasswordEmail]', () => {
    const userMock = new User(createFakeUser(faker) as any)

    it('sends the email to the provided adress with the correct template', async () => {
      const sentStatusMock = { accepted: [], rejected: [] }
      const token = 'abcdefghijklmnopqrstuvwxyz'

      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => sentStatusMock)

      const sent = await authMailerService.sendForgotPasswordEmail(userMock, token)

      expect(mailerService.sendMail).toHaveBeenLastCalledWith({
        to: userMock.email,
        text: expect.anything(),
        html: expect.anything(),
        subject: expect.anything()
      })

      expect(sent.meta.token).toBe(token)
      expect(typeof sent.meta.link).toBe('string')
      expect(sent.emailSendingStatus).toBe(sentStatusMock)
    })

    it('Fails with UnprocessableEntityException on email sending failure', async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => ({ accepted: [], rejected: ['some.email@gmail.com'] }))
      await expect(authMailerService.sendForgotPasswordEmail(userMock, 'someToken')).rejects.toThrow(UnprocessableEntityException)
    })
  })
})
