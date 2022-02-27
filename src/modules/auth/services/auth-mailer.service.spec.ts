import { AuthMailerService } from './auth-mailer.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UnprocessableEntityException } from '@nestjs/common'

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
    const token = 'imatoken'

    it('sends the email to the provided adress with the correct template', async () => {
      const sentStatusMock = { accepted: [], rejected: [] }
      const email = 'some.email@gmail.com'

      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => sentStatusMock)
      jest.spyOn(jwtService, 'sign').mockImplementationOnce(() => token)

      const sent = await authMailerService.sendEmailAdressConfirmationEmail(email)

      expect(mailerService.sendMail).toHaveBeenLastCalledWith({
        to: email,
        subject: expect.anything(),
        text: expect.anything(),
        html: expect.anything()
      })
      expect(typeof sent.confirmation.link).toBe('string')
      expect(sent.confirmation.token).toBe(token)
      expect(sent.emailSendingStatus).toBe(sentStatusMock)
    })

    it('Fails with UnprocessableEntityException on email sending failure', async () => {
      const email = 'some.email@gmail.com'
      const sentStatusMock = { accepted: [], rejected: [email] }

      jest.spyOn(mailerService, 'sendMail').mockImplementationOnce(async () => sentStatusMock)

      await expect(authMailerService.sendEmailAdressConfirmationEmail(email)).rejects.toThrow(UnprocessableEntityException)
    })
  })
})
