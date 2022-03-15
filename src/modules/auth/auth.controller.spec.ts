import { createFakeMasterUser } from '../../database/factories/master-user.factory'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { MasterUserService } from '../user/services/master-user.service'
import { createFakeUser } from '../../database/factories/user.factory'
import { AuthMailerService } from './services/auth-mailer.service'
import { AuthTokenService } from './services/auth-token.service'
import { UserService } from '../user/services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { createRepositoryMock } from '../../../test/mocks/repository.mock'

describe('AuthController', () => {
  let authMailerService: AuthMailerService
  let masterUserService: MasterUserService
  let authTokenService: AuthTokenService
  let controller: AuthController
  let authService: AuthService
  let userService: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'testing_token_secret', signOptions: { expiresIn: '60s' } })],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            login: jest.fn(),
            comparePasswords: jest.fn(),
            setUserAutoLoginToken: jest.fn(),
            resetUserPasswordByToken: jest.fn(),
            setUserResetPasswordToken: jest.fn()
          })
        },
        {
          provide: AuthMailerService,
          useFactory: () => ({
            sendForgotPasswordEmail: jest.fn(),
            sendEmailAdressConfirmationEmail: jest.fn()
          })
        },
        {
          provide: AuthTokenService,
          useFactory: () => ({
            validateAndDecodeToken: jest.fn(),
            getUserOrMasterUserByEmail: jest.fn(),
            getUserFromDecodedTokenOrFail: jest.fn()
          })
        },
        {
          provide: MasterUserService,
          useFactory: () => ({
            updateMasterUser: jest.fn()
          })
        },
        {
          provide: UserService,
          useFactory: () => ({
            updateUser: jest.fn(),
            userRepository: createRepositoryMock(),
            getUserForGoogleProfile: jest.fn(),
            createOrFindUnregisteredUserForGoogleProfile: jest.fn()
          })
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn()
          })
        }
      ],
      controllers: [AuthController]
    }).compile()

    controller = module.get(AuthController)
    userService = module.get(UserService)
    authService = module.get(AuthService)
    authTokenService = module.get(AuthTokenService)
    authMailerService = module.get(AuthMailerService)
    masterUserService = module.get(MasterUserService)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
    expect(authService).toBeDefined()
    expect(userService).toBeDefined()
    expect(authMailerService).toBeDefined()
  })

  it('[login] calls the service login function', () => {
    controller.login({} as any)
    controller.authenticate()

    expect(authService.login).toHaveBeenCalledTimes(1)
    expect(authService.login).toHaveBeenLastCalledWith({})
  })

  it('[reset-password] resets the user password', async () => {
    const dto = { password: 'newPass123!', passwordResetToken: 'iodasjdoiashjidas' }

    await controller.changeRequestUserPassword(dto)

    expect(authService.resetUserPasswordByToken).toHaveBeenCalledTimes(1)
    expect(authService.resetUserPasswordByToken).toHaveBeenLastCalledWith(dto)
  })

  describe('[sendForgotPasswordEmail]', () => {
    it('Fails with not FoundException if theres no user with the email', () => {
      return expect(controller.sendForgotPasswordEmail({ email: 'nonmail' })).rejects.toBeInstanceOf(NotFoundException)
    })

    it('Sets a new passwordResetToken for the user', async () => {
      const userMock = { id: 1 }
      jest.spyOn(authTokenService, 'getUserOrMasterUserByEmail').mockImplementationOnce(async () => userMock as any)

      await controller.sendForgotPasswordEmail({ email: 'potato@gmail.com' })

      expect(authService.setUserResetPasswordToken).toHaveBeenLastCalledWith(userMock)
    })

    it('Sends the email with the new token to the user email address', async () => {
      const userMock = { id: 1, email: 'user.mail@gmail.com' }
      const tokenMock = 'asjdoiajsoidasid'

      jest.spyOn(authTokenService, 'getUserOrMasterUserByEmail').mockImplementationOnce(async () => userMock as any)
      jest.spyOn(authService, 'setUserResetPasswordToken').mockImplementationOnce(async () => tokenMock)

      await controller.sendForgotPasswordEmail({ email: userMock.email })

      expect(authService.setUserResetPasswordToken).toHaveBeenLastCalledWith(userMock)
      expect(authMailerService.sendForgotPasswordEmail).toHaveBeenLastCalledWith(userMock, tokenMock)
    })
  })

  it('[checkPassword] compares the current user password and the provided password with the authservice', async () => {
    const user = createFakeUser(true)
    user.password = 'currentUserHashedPass'

    await controller.checkPassword(user, { password: 'passwordToTestAgainst' })
    expect(authService.comparePasswords).toHaveBeenLastCalledWith('passwordToTestAgainst', 'currentUserHashedPass')
  })

  it('[confirmEmailAddress] confirms the email adress according to the user type', async () => {
    const masterUserMock = createFakeMasterUser(true)
    const userMock = createFakeUser(true)

    let res = await controller.confirmEmailAddress(userMock)
    expect(typeof res === 'string').toBe(true)
    expect(userService.updateUser).toHaveBeenCalledTimes(1)
    expect(userService.updateUser).toHaveBeenLastCalledWith(userMock, { emailVerified: true })

    res = await controller.confirmEmailAddress(masterUserMock)
    expect(typeof res === 'string').toBe(true)
    expect(masterUserService.updateMasterUser).toHaveBeenCalledTimes(1)
    expect(masterUserService.updateMasterUser).toHaveBeenLastCalledWith(masterUserMock, { emailVerified: true })
  })

  it('[sendEmailConfirmation] request email to be sent with the authMailerService', () => {
    const userMock = { id: 1, email: 'meme@gmail.com' } as any

    controller.sendEmailConfirmation(userMock)
    expect(authMailerService.sendEmailAdressConfirmationEmail).toHaveBeenLastCalledWith(userMock.email)
  })

  describe('[handleGoogleOauthCallback]', () => {
    const googleProfileMock = { id: 1, im: 'a google profile mock' }
    const unregisteredUserMock = { uuid: 'abc' }
    const res = { redirect: jest.fn() }

    describe('On attempt to link existing account to google profile', () => {
      const statefullRequestMock = { query: { state: 'sometoken' } } as any
      const masterUserMock = createFakeMasterUser(true)

      it('Fails if trying to link a master user account', async () => {
        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => masterUserMock)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Fails if the existing user already has a google profile', async () => {
        const userMock = createFakeUser(true)
        userMock.googleProfileId = 'someexistingprofile'

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => userMock)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Fails if the google profile is in use by another user', async () => {
        const existingUserWithGoogleProfile = createFakeUser(true)
        existingUserWithGoogleProfile.googleProfileId = 'someexistingprofile'

        const otherUserMock = createFakeUser(true)

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => otherUserMock)
        jest.spyOn(userService, 'getUserForGoogleProfile').mockImplementation(async () => existingUserWithGoogleProfile)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Updates the user to contain the new googleProfileId', async () => {
        const userMock = createFakeUser(true)
        userMock.googleProfileId = null

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => userMock)

        await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)

        expect(userService.updateUser).toHaveBeenLastCalledWith(userMock, { googleProfileId: googleProfileMock.id })
      })
    })

    it('creates a unregistered user if there is no user for the profile', async () => {
      jest.spyOn(userService, 'createOrFindUnregisteredUserForGoogleProfile').mockImplementation(async () => unregisteredUserMock as any)

      await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, { query: '' } as any)

      expect(userService.getUserForGoogleProfile).toHaveBeenCalledTimes(1)
      expect(userService.getUserForGoogleProfile).toHaveBeenLastCalledWith(googleProfileMock.id)
      expect(userService.createOrFindUnregisteredUserForGoogleProfile).toHaveBeenLastCalledWith(googleProfileMock)
    })

    it('redirects to the registration page if there is no user for the profile', async () => {
      jest.spyOn(userService, 'createOrFindUnregisteredUserForGoogleProfile').mockImplementation(async () => unregisteredUserMock as any)
      res.redirect.mockClear()

      await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, { query: '' } as any)

      expect(res.redirect).toHaveBeenCalledTimes(1)

      const lastResRedirectArg = res.redirect.mock.calls[0][0]
      expect(typeof lastResRedirectArg === 'string').toBe(true)
      expect((lastResRedirectArg as string).endsWith(`/register?finishFor=${unregisteredUserMock.uuid}`)).toBe(true)
    })

    it('logins and redirects to the auto login page if a user exists for the profile', async () => {
      const tokenMock = 'im_a_jwt'
      const userMock = { id: 1 }

      jest.spyOn(userService, 'getUserForGoogleProfile').mockImplementation(async () => userMock as any)
      jest.spyOn(authService, 'setUserAutoLoginToken').mockImplementation(async () => tokenMock)
      res.redirect.mockClear()

      await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, { query: '' } as any)

      expect(authService.setUserAutoLoginToken).toHaveBeenLastCalledWith(userMock)
      expect(res.redirect).toHaveBeenCalledTimes(1)

      const lastResRedirectArg = res.redirect.mock.calls[0][0]
      expect(typeof lastResRedirectArg === 'string').toBe(true)

      expect((lastResRedirectArg as string).endsWith(`/auto-login?token=${tokenMock}`)).toBe(true)
    })
  })
})
