import { MasterUserService } from '../user/services/master-user.service'
import { AuthMailerService } from './services/auth-mailer.service'
import { AuthTokenService } from './services/auth-token.service'
import { UserService } from '../user/services/user.service'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

describe('AuthController', () => {
  let authMailerService: AuthMailerService
  let authService: AuthService
  let userService: UserService
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'testing_token_secret', signOptions: { expiresIn: '60s' } })],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            login: jest.fn(),
            getUserForGoogleProfile: jest.fn()
          })
        },
        {
          provide: AuthMailerService,
          useFactory: () => ({})
        },
        {
          provide: AuthTokenService,
          useFactory: () => ({})
        },
        {
          provide: MasterUserService,
          useFactory: () => ({})
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn()
          })
        },
        {
          provide: UserService,
          useFactory: () => ({
            createOrFindUnregisteredUserForGoogleProfile: jest.fn()
          })
        }
      ],
      controllers: [AuthController]
    }).compile()

    controller = module.get(AuthController)
    userService = module.get(UserService)
    authService = module.get(AuthService)
    authMailerService = module.get(AuthMailerService)
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

  describe('[handleGoogleOauthCallback]', () => {
    const res = { redirect: jest.fn() }
    const googleProfileMock = { id: 1, im: 'a google profile mock' }

    const unregisteredUserMock = { uuid: 'abc' }

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
