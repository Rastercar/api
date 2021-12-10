import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user/user.service'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let userService: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        { provide: JwtService, useFactory: () => ({ sign: jest.fn() }) },
        { provide: UserService, useFactory: () => ({}) }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
    userService = module.get(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(jwtService).toBeDefined()
    expect(userService).toBeDefined()
  })
})
