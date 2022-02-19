import { UnregisteredUserRepository } from '../user/repositories/unregistered-user.repository'
import { OrganizationRepository } from '../organization/repositories/organization.repository'
import { MasterUserRepository } from '../user/repositories/master-user.repository'
import { createFakeMasterUser } from '../../database/seeders/master-user.seeder'
import { createRepositoryMock } from '../../../test/mocks/repository.mock'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UserRepository } from '../user/repositories/user.repository'
import { createFakeUser } from '../../database/seeders/user.seeder'
import { createEmptyMocksFor } from '../../../test/utils/mocking'
import { MasterUser } from '../user/entities/master-user.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '../user/entities/user.entity'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { faker } from '@mikro-orm/seeder'
import { Loaded } from '@mikro-orm/core'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
  let unregisteredUserRepository: UnregisteredUserRepository
  let organizationRepository: OrganizationRepository
  let masterUserRepository: MasterUserRepository
  let userRepository: UserRepository
  let jwtService: JwtService
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        ...createEmptyMocksFor(
          [UserRepository, MasterUserRepository, UnregisteredUserRepository, OrganizationRepository],
          createRepositoryMock
        ),
        {
          provide: JwtService,
          useFactory: () => ({ sign: jest.fn(), decode: jest.fn(), verifyAsync: jest.fn() })
        }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
    userRepository = module.get(UserRepository)
    masterUserRepository = module.get(MasterUserRepository)
    organizationRepository = module.get(OrganizationRepository)
    unregisteredUserRepository = module.get(UnregisteredUserRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(jwtService).toBeDefined()
    expect(userRepository).toBeDefined()
    expect(masterUserRepository).toBeDefined()
    expect(organizationRepository).toBeDefined()
  })

  it('[getUserForGoogleProfile] ensures google is the oauth provider when searching', async () => {
    const googleProfileId = 'profileidmock'
    await service.getUserForGoogleProfile(googleProfileId)

    expect(userRepository.findOne).toHaveBeenLastCalledWith({ googleProfileId })
  })

  describe('[validateUserByCredentials]', () => {
    const userMock = createFakeUser(faker) as Loaded<User, string>
    userMock.password = '$imahashedpass'
    userMock.id = 1

    const credentials = { email: 'some_email@gmail.com', password: 'plain_text_pass' }

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockImplementation(async () => userMock)
    })

    // prettier-ignore
    it('Finds the user by his unique email', async () => {
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      await service.validateUserByCredentials(credentials)
      
      expect(userRepository.findOne).toHaveBeenLastCalledWith({ email: credentials.email }, expect.anything())
    })

    // prettier-ignore
    it('Attempts to find a master user with the email when a regular user is no found', async () => {
      const masterUserMock = new MasterUser(createFakeMasterUser(faker))
      
      jest.spyOn(masterUserRepository, 'findOne').mockImplementationOnce(async () => masterUserMock as any)
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const user = await service.validateUserByCredentials(credentials)
      
      expect(user).toBeInstanceOf(MasterUser)
    })

    // prettier-ignore
    it('Uses bycrypt to compare the passwords', async () => {
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      await service.validateUserByCredentials(credentials)

      expect(bcrypt.compare as jest.Mock).toHaveBeenLastCalledWith(credentials.password, userMock.password)
    })

    // prettier-ignore
    it('Throws a UnauthorizedException on bcrypt comparison fail', async () => {
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false)
      
      await expect(service.validateUserByCredentials(credentials)).rejects.toThrow(UnauthorizedException)
    })

    it('Throws a not found exception when no user is found', async () => {
      jest.spyOn(masterUserRepository, 'findOne').mockImplementationOnce(async () => null)
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null)

      await expect(service.validateUserByCredentials(credentials)).rejects.toThrow(NotFoundException)
    })
  })

  describe('[checkEmailAddressInUse]', () => {
    const email = 'some_email@gmail.com'

    it('checks against organizations and users', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null)
      jest.spyOn(masterUserRepository, 'findOne').mockImplementationOnce(async () => null)
      jest.spyOn(organizationRepository, 'findOne').mockImplementationOnce(async () => ({ id: 1 } as any))

      const inUse = await service.checkEmailAddressInUse(email)

      expect(inUse).toBe(true)
      expect(userRepository.findOne).toHaveBeenLastCalledWith({ email }, expect.anything())
      expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ email }, expect.anything())
      expect(organizationRepository.findOne).toHaveBeenLastCalledWith({ billingEmail: email }, expect.anything())
    })
  })

  describe('[login]', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(new Date(2020, 3, 1))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    const userMock = { id: 1, password: 'i_should_be_removed', lastLogin: new Date() } as any

    it('Changes the user lastLogin field when options.setLastLogin is not false', async () => {
      jest.spyOn(userRepository, 'persistAndFlush')
      await service.login(userMock)

      expect(userRepository.persistAndFlush).toHaveBeenLastCalledWith({ ...userMock, lastLogin: new Date() })
    })

    it('Removes the user password before returning it', async () => {
      const result = await service.login(userMock)
      expect((result.user as any).password).toBe(undefined)
    })

    it('Removes the user unregistered_user record if the user uses oauth', async () => {
      const userOauthData = { googleProfileId: 'abc' }

      await service.login(new User({ ...userMock, ...userOauthData }))

      expect(unregisteredUserRepository.nativeDelete).toHaveBeenLastCalledWith({
        oauthProfileId: userOauthData.googleProfileId,
        oauthProvider: 'google'
      })
    })
  })

  describe('[loginWithToken]', () => {
    const token = 'imatoken'

    it('Fails if token is invalid or expired', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error())

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token subject is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 1 })

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token is valid but has no subject', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: '' })

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token subject is not a existing user', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 'user-9999' })
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null)

      await expect(service.loginWithToken(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Returns a passwordless user and his new bearer token on success', async () => {
      const userMock = { id: 1 }
      const returnedTokenMock = 'imthenewtoken'

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(returnedTokenMock)
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 'user-1' })
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => userMock as any)

      const { user, token: newToken } = await service.loginWithToken(token)

      expect(user).toEqual(userMock)
      expect(newToken).toEqual({ type: 'bearer', value: returnedTokenMock })
    })
  })
})
