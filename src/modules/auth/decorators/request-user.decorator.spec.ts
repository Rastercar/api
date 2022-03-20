import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { requestUserFactory } from './request-user.decorator'
import { UnauthorizedException } from '@nestjs/common'
import httpMock from 'node-mocks-http'

const userMock = {
  id: 1,
  password: '#@(*#^!*&AUSYBD&!',
  username: 'jhon123'
}

describe('@RequestUser', () => {
  it('Should extract the request user when no param is provided', () => {
    const req = httpMock.createRequest()

    req.user = userMock

    const ctx = new ExecutionContextHost([req])
    const result = requestUserFactory(undefined, ctx)

    expect(result).toEqual(userMock)
  })

  it('Should return a single param when a user and a param is provided', () => {
    const req = httpMock.createRequest()
    req.user = userMock
    const ctx = new ExecutionContextHost([req])

    expect(requestUserFactory('id', ctx)).toBe(userMock.id)
  })

  it('Should throw a UnauthorizedException when theres no user in the request', () => {
    const req = httpMock.createRequest()
    const ctx = new ExecutionContextHost([req])

    expect(() => {
      requestUserFactory(undefined, ctx)
    }).toThrow(UnauthorizedException)
  })
})
