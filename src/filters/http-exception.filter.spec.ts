import { HttpException, InternalServerErrorException } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'
import { Test, TestingModule } from '@nestjs/testing'

describe('HTTP Exception filter', () => {
  let filter: HttpExceptionFilter

  const mockJson = jest.fn()

  const mockStatus = jest.fn().mockImplementation(() => ({ json: mockJson }))

  const mockGetResponse = jest.fn().mockImplementation(() => ({ status: mockStatus }))

  const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
    getResponse: mockGetResponse,
    getRequest: jest.fn()
  }))

  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn()
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter]
    }).compile()

    filter = module.get(HttpExceptionFilter)
  })

  it('Returns the exception as it is when the context differs from http', () => {
    const error = new InternalServerErrorException()
    const formatedError = filter.catch(error, mockArgumentsHost)

    expect(formatedError).toEqual(error)
  })

  it('Removes the message prop that would contain the error name when a message was not specified', () => {
    mockArgumentsHost.getType.mockImplementationOnce(() => 'http')

    const error = new InternalServerErrorException()

    filter.catch(error, mockArgumentsHost)

    expect(mockGetResponse).toBeCalledTimes(1)
    expect(mockGetResponse).toBeCalledWith()
    expect(mockStatus).toBeCalledTimes(1)
    expect(mockStatus).toBeCalledWith(error.getStatus())
    expect(mockJson).toBeCalledTimes(1)

    const mockJsonArgs = mockJson.mock.calls[0][0]

    expect(mockJsonArgs.message).toBeUndefined()
    expect(mockJsonArgs.error).toBe(error.message)
  })

  it('Puts the error message in the response message prop when a message was supllied to the error', () => {
    mockArgumentsHost.getType.mockImplementationOnce(() => 'http')

    const errorMsg = 'error msg'
    const error = new InternalServerErrorException(errorMsg)

    filter.catch(error, mockArgumentsHost)

    expect(mockJson).toBeCalledTimes(1)

    const mockJsonArgs = mockJson.mock.calls[0][0]

    expect(mockJsonArgs.message).toBe(errorMsg)
    expect(mockJsonArgs.error).toBe((error.getResponse() as any).error)
  })

  it('Sends the error body within the response when the error contains a object', () => {
    mockArgumentsHost.getType.mockImplementationOnce(() => 'http')
    const errorBody = { one: 1, two: 2 }

    const error = new HttpException(errorBody, 500)

    filter.catch(error, mockArgumentsHost)

    expect(mockJson).toBeCalledTimes(1)
    const mockJsonArgs = mockJson.mock.calls[0][0]

    expect(mockJsonArgs.message).toBe(errorBody)
  })

  it('Sends the error body within the response when the error contains a string', () => {
    mockArgumentsHost.getType.mockImplementationOnce(() => 'http')
    const errorBody = 'im the body'

    const error = new HttpException(errorBody, 500)

    filter.catch(error, mockArgumentsHost)

    expect(mockJson).toBeCalledTimes(1)
    const mockJsonArgs = mockJson.mock.calls[0][0]

    expect(mockJsonArgs.message).toBe(errorBody)
  })
})
