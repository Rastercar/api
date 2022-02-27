import { Test, TestingModule } from '@nestjs/testing'
import { GoogleStrategy } from './google.strategy'
import { Strategy } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'

describe('Google Strategy', () => {
  let configService!: ConfigService
  let cfgServiceSpy!: jest.SpyInstance

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigService]
    }).compile()

    configService = module.get(ConfigService)

    cfgServiceSpy = jest.spyOn(configService, 'get').mockImplementation((thingToGet: string) => {
      const dict = {
        API_BASE_URL: 'https://mysite.com',
        GOOGLE_OAUTH_CLIENT_ID: 'oauthCLientId',
        GOOGLE_OAUTH_CLIENT_SECRET: 'oauthClientSecret'
      }
      return dict[thingToGet]
    })
  })

  it('Uses the ENV vars to setup google oauth settings', async () => {
    new GoogleStrategy(configService).validate('', '', {} as any, () => null)

    expect(cfgServiceSpy).toHaveBeenCalledTimes(3)
    expect(cfgServiceSpy.mock.calls[0][0]).toBe('GOOGLE_OAUTH_CLIENT_ID')
    expect(cfgServiceSpy.mock.calls[1][0]).toBe('GOOGLE_OAUTH_CLIENT_SECRET')
    expect(cfgServiceSpy.mock.calls[2][0]).toBe('API_BASE_URL')
  })

  it('Pass the original request existingUserToken as the state before redirecting to google', async () => {
    const strategy = new GoogleStrategy(configService)

    const superSpy = jest.spyOn(Strategy.prototype, 'authenticate').mockImplementation(() => true)

    const reqMock = { query: { forExistingUser: 'some-dummy-token' } } as any

    await strategy.authenticate(reqMock)

    expect(superSpy).toHaveBeenLastCalledWith(reqMock, { state: reqMock.query.forExistingUser })

    await strategy.authenticate({ query: {} } as any)

    expect(superSpy).toHaveBeenLastCalledWith({ query: {} })
  })
})
