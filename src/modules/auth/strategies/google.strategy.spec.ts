import { Test, TestingModule } from '@nestjs/testing'
import { GoogleStrategy } from './google.strategy'
import { ConfigService } from '@nestjs/config'

it('Uses the ENV vars to setup google oauth settings', async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigService]
  }).compile()

  const configService = module.get(ConfigService)

  const getSpy = jest.spyOn(configService, 'get').mockImplementation((thingToGet: string) => {
    const dict = {
      API_BASE_URL: 'https://mysite.com',
      GOOGLE_OAUTH_CLIENT_ID: 'oauthCLientId',
      GOOGLE_OAUTH_CLIENT_SECRET: 'oauthClientSecret'
    }
    return dict[thingToGet]
  })

  new GoogleStrategy(configService).validate('', '', {} as any, () => null)

  expect(getSpy).toHaveBeenCalledTimes(3)
  expect(getSpy.mock.calls[0][0]).toBe('GOOGLE_OAUTH_CLIENT_ID')
  expect(getSpy.mock.calls[1][0]).toBe('GOOGLE_OAUTH_CLIENT_SECRET')
  expect(getSpy.mock.calls[2][0]).toBe('API_BASE_URL')
})
