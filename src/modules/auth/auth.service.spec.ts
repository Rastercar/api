import { OrganizationService } from '../organization/organization.service'
import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user/user.service'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
  let organizationService: OrganizationService
  let userService: UserService
  let jwtService: JwtService
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        {
          provide: UserService,
          useFactory: () => ({
            userRepository: {
              findOne: jest.fn(),
              findOneOrFail: jest.fn(),
              persistAndFlush: jest.fn()
            },
            unregisteredUserRepository: {
              nativeDelete: jest.fn()
            }
          })
        },
        {
          provide: OrganizationService,
          useFactory: () => ({
            organizationRepository: {
              findOne: jest.fn()
            }
          })
        },
        {
          provide: JwtService,
          useFactory: () => ({
            sign: jest.fn(),
            decode: jest.fn(),
            verifyAsync: jest.fn()
          })
        }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
    userService = module.get(UserService)
    organizationService = module.get(OrganizationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(jwtService).toBeDefined()
    expect(userService).toBeDefined()
    expect(organizationService).toBeDefined()
  })

  describe('[validateUserByCredentials]', () => {
    const userMock = { id: 1, password: '$imahashedpass' }

    const credentials = { email: 'some_email@gmail.com', password: 'plain_text_pass' }

    beforeEach(() => {
      jest.spyOn(userService.userRepository, 'findOneOrFail').mockImplementation(async () => userMock as any)
    })

    it('Finds the user by his unique email', async () => {
      // prettier-ignore
      const findOneOrFailSpy = jest.spyOn(userService.userRepository, 'findOneOrFail');
      // prettier-ignore
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      await service.validateUserByCredentials(credentials)

      expect(findOneOrFailSpy).toHaveBeenLastCalledWith({ email: credentials.email })
    })

    it('Uses bycrypt to compare the passwords', async () => {
      // prettier-ignore
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      await service.validateUserByCredentials(credentials)

      expect(bcrypt.compare as jest.Mock).toHaveBeenLastCalledWith(credentials.password, userMock.password)
    })

    it('Throws a UnauthorizedException on bcrypt comparison fail', async () => {
      // prettier-ignore
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false)
      await expect(service.validateUserByCredentials(credentials)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('[checkEmailAddressInUse]', () => {
    const email = 'some_email@gmail.com'

    it('checks against organizations and users', async () => {
      const orgFindOneSpy = jest
        .spyOn(organizationService.organizationRepository, 'findOne')
        .mockImplementationOnce(async () => ({ id: 1 } as any))

      const userFindOneSpy = jest.spyOn(userService.userRepository, 'findOne').mockImplementationOnce(async () => null)

      const inUse = await service.checkEmailAddressInUse(email)

      expect(orgFindOneSpy).toHaveBeenLastCalledWith({ billingEmail: email }, expect.anything())
      expect(userFindOneSpy).toHaveBeenLastCalledWith({ email }, expect.anything())

      expect(inUse).toBe(true)
    })
  })

  it('[getUserForGoogleProfile] ensures google is the oauth provider when searching', async () => {
    const userFindOneSpy = jest.spyOn(userService.userRepository, 'findOne')
    const googleProfileId = 'profileidmock'

    await service.getUserForGoogleProfile(googleProfileId)

    expect(userFindOneSpy).toHaveBeenLastCalledWith({ oauthProfileId: googleProfileId, oauthProvider: 'google' })
  })

  describe('[login]', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(new Date(2020, 3, 1))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    const userMock = { id: 1, password: 'i_should_be_removed' } as any
    const { password, ...userWithoutPassword } = userMock

    it('Changes the user lastLogin field when options.setLastLogin is not false', async () => {
      const persistSpy = jest.spyOn(userService.userRepository, 'persistAndFlush')

      await service.login(userMock)

      expect(persistSpy).toHaveBeenLastCalledWith({ ...userMock, lastLogin: new Date() })
    })

    it('Removes the user password before returning it', async () => {
      const result = await service.login(userMock)
      expect(result.user).toStrictEqual(userWithoutPassword)
    })

    it('Removes the user unregistered_user record if the user uses oauth', async () => {
      const userOauthData = { oauthProfileId: 'abc', oauthProvider: 'google' }

      await service.login({ ...userMock, ...userOauthData })

      expect(userService.unregisteredUserRepository.nativeDelete).toHaveBeenLastCalledWith(userOauthData)
    })
  })

  describe('[loginWithToken]', () => {
    const token = 'imatoken'

    it('Fails if token is invalid or expired', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error())

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token is valid but has no subject', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ im: 'a useless token' })

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token subject is not a existing user', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 1 })
      jest.spyOn(userService.userRepository, 'findOne').mockImplementationOnce(async () => null)

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Returns a passwordless user and his new bearer token on success', async () => {
      const userMock = { id: 1 }
      const returnedTokenMock = 'imthenewtoken'

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(returnedTokenMock)
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 1 })
      jest.spyOn(userService.userRepository, 'findOne').mockImplementationOnce(async () => userMock as any)

      const { user, token: newToken } = await service.loginWithToken(token)

      expect(user).toEqual(userMock)
      expect(newToken).toEqual({ type: 'bearer', value: returnedTokenMock })
    })
  })
})
