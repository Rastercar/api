import { createFakeMasterUser } from '../../database/seeders/master-user.seeder'
import { MasterUserService } from '../user/services/master-user.service'
import { createFakeUser } from '../../database/seeders/user.seeder'
import { AuthMailerService } from './services/auth-mailer.service'
import { AuthTokenService } from './services/auth-token.service'
import { MasterUser } from '../user/entities/master-user.entity'
import { UserService } from '../user/services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './services/auth.service'
import { User } from '../user/entities/user.entity'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { faker } from '@mikro-orm/seeder'
import { JwtModule } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'

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
            getUserForGoogleProfile: jest.fn()
          })
        },
        {
          provide: AuthMailerService,
          useFactory: () => ({
            sendEmailAdressConfirmationEmail: jest.fn()
          })
        },
        {
          provide: AuthTokenService,
          useFactory: () => ({
            validateAndDecodeToken: jest.fn(),
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

  it('[checkPassword] compares the current user password and the provided password with the authservice', () => {
    controller.checkPassword('currentUserHashedPassword', { password: 'passwordToTestAgainst' })
    expect(authService.comparePasswords).toHaveBeenLastCalledWith('passwordToTestAgainst', 'currentUserHashedPassword')
  })

  it('[confirmEmailAddress] confirms the email adress according to the user type', async () => {
    const masterUserMock = new MasterUser(createFakeMasterUser(faker) as any)
    const userMock = new User(createFakeUser(faker) as any)

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
      const masterUserMock = new MasterUser(createFakeMasterUser(faker) as any)
      const createUserMock = () => new User(createFakeUser(faker) as any)

      it('Fails if trying to link a master user account', async () => {
        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => masterUserMock)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Fails if the existing user already has a google profile', async () => {
        const userMock = createUserMock()
        userMock.googleProfileId = 'someexistingprofile'

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => userMock)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Fails if the google profile is in use by another user', async () => {
        const existingUserWithGoogleProfile = createUserMock()
        existingUserWithGoogleProfile.googleProfileId = 'someexistingprofile'

        const otherUserMock = createUserMock()

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => otherUserMock)
        jest.spyOn(authService, 'getUserForGoogleProfile').mockImplementation(async () => existingUserWithGoogleProfile)

        await expect(
          controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)
        ).rejects.toThrow(UnauthorizedException)
      })

      it('Updates the user to contain the new googleProfileId', async () => {
        const userMock = createUserMock()
        userMock.googleProfileId = null

        jest.spyOn(authTokenService, 'getUserFromDecodedTokenOrFail').mockImplementation(async () => userMock)

        await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, statefullRequestMock as any)

        expect(userService.updateUser).toHaveBeenLastCalledWith(userMock, { googleProfileId: googleProfileMock.id })
      })
    })

    it('creates a unregistered user if there is no user for the profile', async () => {
      jest.spyOn(userService, 'createOrFindUnregisteredUserForGoogleProfile').mockImplementation(async () => unregisteredUserMock as any)

      await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, { query: '' } as any)

      expect(authService.getUserForGoogleProfile).toHaveBeenCalledTimes(1)
      expect(authService.getUserForGoogleProfile).toHaveBeenLastCalledWith(googleProfileMock.id)
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
      const userMock = { id: 1 }
      const tokenMock = { value: 'im_a_jwt' }

      jest.spyOn(authService, 'getUserForGoogleProfile').mockImplementation(async () => userMock as any)
      jest.spyOn(authService, 'login').mockImplementation(async () => ({ token: tokenMock } as any))
      res.redirect.mockClear()

      await controller.handleGoogleOauthCallback(googleProfileMock as any, res as any, { query: '' } as any)

      expect(authService.login).toHaveBeenLastCalledWith(userMock, expect.anything())
      expect(res.redirect).toHaveBeenCalledTimes(1)

      const lastResRedirectArg = res.redirect.mock.calls[0][0]
      expect(typeof lastResRedirectArg === 'string').toBe(true)

      expect((lastResRedirectArg as string).endsWith(`/auto-login?token=${tokenMock.value}`)).toBe(true)
    })
  })
})
