import { createEmptyMocksFor } from '../../../test/utils/mocking'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'testing_token_secret', signOptions: { expiresIn: '60s' } })],
      providers: [{ provide: AuthService, useFactory: () => ({ login: jest.fn() }) }, ...createEmptyMocksFor([UserService])],
      controllers: [AuthController]
    }).compile()

    controller = module.get(AuthController)
    authService = module.get(AuthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(authService).toBeDefined()
  })

  it('[login] should call the service login function', () => {
    controller.login({} as any)
    expect(authService.login).toHaveBeenCalledTimes(1)
    expect(authService.login).toHaveBeenLastCalledWith({})
  })
})
