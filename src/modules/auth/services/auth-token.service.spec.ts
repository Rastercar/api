import { MasterUserRepository } from '../../user/repositories/master-user.repository'
import { createRepositoryMock } from '../../../../test/mocks/repository.mock'
import { UserRepository } from '../../user/repositories/user.repository'
import { createEmptyMocksFor } from '../../../../test/utils/mocking'
import { UnauthorizedException } from '@nestjs/common'
import { AuthTokenService } from './auth-token.service'
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
          useFactory: () => ({ sign: jest.fn(), decode: jest.fn(), verifyAsync: jest.fn() })
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

  describe('[getUserFromTokenOrFail]', () => {
    const token = 'imatoken'

    it('Fails if token is invalid or expired', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error())

      await expect(service.getUserFromTokenOrFail(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token subject is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 1 })

      await expect(service.getUserFromTokenOrFail(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token is valid but has no subject', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: '' })

      await expect(service.getUserFromTokenOrFail(token)).rejects.toThrow(UnauthorizedException)
    })

    it('Fails if token subject is not a existing user', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
      jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 'user-9999' })
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => null)

      await expect(service.getUserFromTokenOrFail(token)).rejects.toThrow(UnauthorizedException)
    })

    // it('Returns a passwordless user and his new bearer token on success', async () => {
    //   const userMock = { id: 1 }
    //   const returnedTokenMock = 'imthenewtoken'

    //   jest.spyOn(jwtService, 'sign').mockReturnValueOnce(returnedTokenMock)
    //   jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => ({}))
    //   jest.spyOn(jwtService, 'decode').mockReturnValueOnce({ sub: 'user-1' })
    //   jest.spyOn(userRepository, 'findOne').mockImplementationOnce(async () => userMock as any)

    //   const { user } = await service.getUserFromTokenOrFail(token)

    //   expect(user).toEqual(userMock)
    //   expect(newToken).toEqual({ type: 'bearer', value: returnedTokenMock })
    // })
  })
})
