import { createFakeMasterUser } from '../../../database/postgres/factories/master-user.factory'
import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { createFakeUser } from '../../../database/postgres/factories/user.factory'
import { UserRepository } from '../../user/repositories/user.repository'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { AuthTokenService } from './auth-token.service'
import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

describe('AuthTokenService', () => {
  let masterUserRepository: MasterUserRepository
  let userRepository: UserRepository
  let jwtService: JwtService
  let service: AuthTokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        AuthTokenService,
        ...createEmptyMocksFor([UserRepository, MasterUserRepository], createRepositoryMock),
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

    jwtService = module.get(JwtService)
    service = module.get(AuthTokenService)
    userRepository = module.get(UserRepository)
    masterUserRepository = module.get(MasterUserRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(jwtService).toBeDefined()
    expect(userRepository).toBeDefined()
    expect(masterUserRepository).toBeDefined()
  })

  it('[getUserOrMasterUserByEmail] finds the user or master user by the email address', async () => {
    const email = 'some.mail@gmail.com'

    jest.spyOn(masterUserRepository, 'findOne').mockResolvedValueOnce(createFakeMasterUser(true) as any)

    await service.getUserOrMasterUserByEmail(email)

    expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ email })
    expect(userRepository.findOne).not.toHaveBeenCalled()

    jest.spyOn(masterUserRepository, 'findOne').mockResolvedValueOnce(null)
    jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null)

    const user = await service.getUserOrMasterUserByEmail(email)

    expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ email })
    expect(userRepository.findOne).toHaveBeenLastCalledWith({ email })

    expect(user).toBe(null)
  })

  describe('[validateAndDecodeToken]', () => {
    it('Throws UnauthorizedException on failure', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error())

      const error = await service.validateAndDecodeToken('').catch(e => e)

      expect(error).toBeInstanceOf(UnauthorizedException)
    })

    it('Returns the decode token', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({})
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ something: 123 })

      const decode = await service.validateAndDecodeToken('')
      expect(decode).toEqual({ something: 123 })
    })
  })

  it('[createTokenForUser]', () => {
    const masterUserMock = createFakeMasterUser(true) as any
    masterUserMock.id = 666

    const userMock = createFakeUser(true)
    userMock.id = 555

    const tokenMock = 'asduihaisudaoijsdoisj'

    jest.spyOn(jwtService, 'sign').mockImplementation(() => tokenMock)

    let token = service.createTokenForUser(userMock)

    expect(token).toStrictEqual({ type: 'bearer', value: tokenMock })
    expect(jwtService.sign).toHaveBeenLastCalledWith({ sub: 'user-555' }, undefined)

    token = service.createTokenForUser(masterUserMock)
    expect(token).toStrictEqual({ type: 'bearer', value: tokenMock })
    expect(jwtService.sign).toHaveBeenLastCalledWith({ sub: 'masteruser-666' }, undefined)
  })

  describe('[getUserFromDecodedTokenOrFail]', () => {
    it('Fails if token subject is invalid', async () => {
      await expect(service.getUserFromDecodedTokenOrFail({ sub: [] })).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail({ sub: 1 })).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail(null)).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail([])).rejects.toThrow(UnauthorizedException)
    })

    describe('On email subject', () => {
      it('Finds the user by the email', async () => {
        const email = 'mock.email@gmail.com'
        const token = { sub: email }

        jest.spyOn(service, 'getUserOrMasterUserByEmail').mockImplementationOnce(async () => ({ id: 1 } as any))

        const user = await service.getUserFromDecodedTokenOrFail(token)

        expect(service.getUserOrMasterUserByEmail).toHaveBeenLastCalledWith(email)
        expect(user).toBeDefined()
      })

      it('Throws UnauthorizedException if cant find the user by email', async () => {
        jest.spyOn(service, 'getUserOrMasterUserByEmail').mockImplementationOnce(async () => null)
        await expect(service.getUserFromDecodedTokenOrFail({ sub: 'mock.email@gmail.com' })).rejects.toThrow(UnauthorizedException)
      })
    })

    it('Fails if token subject is not a valid identifier', async () => {
      await expect(service.getUserFromDecodedTokenOrFail({ sub: 'notauserid-1' })).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail({ sub: '1' })).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail({ sub: 1 })).rejects.toThrow(UnauthorizedException)
      await expect(service.getUserFromDecodedTokenOrFail({ sub: [] })).rejects.toThrow(UnauthorizedException)
    })

    it('Finds the user type specified by the identifier', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(() => ({ id: 1 } as any))
      await service.getUserFromDecodedTokenOrFail({ sub: 'user-1' })

      expect(userRepository.findOne).toHaveBeenLastCalledWith({ id: 1 })

      jest.spyOn(masterUserRepository, 'findOne').mockImplementationOnce(() => ({ id: 1 } as any))
      await service.getUserFromDecodedTokenOrFail({ sub: 'masteruser-1' })

      expect(masterUserRepository.findOne).toHaveBeenLastCalledWith({ id: 1 })
    })

    it('Throws UnauthorizedException if cant find the user id', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null)
      await expect(service.getUserFromDecodedTokenOrFail({ sub: 'user-1' })).rejects.toThrow(UnauthorizedException)
    })
  })
})
