import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { ValidLoginRequestGuard } from './valid-login-request.guard'
import { BadRequestException } from '@nestjs/common'
import { LoginDTO } from '../dtos/login.dto'
import * as httpMock from 'node-mocks-http'

describe('[GUARD] ValidLoginRequest', () => {
  let guard: ValidLoginRequestGuard
  let req: any

  beforeEach(() => {
    guard = new ValidLoginRequestGuard()
    req = httpMock.createRequest()
  })

  it('should throw a BadRequestException when the request body is not present', () => {
    expect(() => {
      guard.canActivate(new ExecutionContextHost([req]))
    }).toThrow(BadRequestException)
  })

  it('should throw a BadRequestException when the request body is invalid', () => {
    req.body = { username: 123, password: 'srt' }

    expect(() => {
      guard.canActivate(new ExecutionContextHost([req]))
    }).toThrow(BadRequestException)
  })

  it('should allow valid login requests', () => {
    const body: LoginDTO = { email: 'valid.email@gmail.com', password: 'valid_password' }
    req.body = body

    expect(guard.canActivate(new ExecutionContextHost([req]))).toBe(true)
  })
})
