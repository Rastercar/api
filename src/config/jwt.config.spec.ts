import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { jwtConfig } from './jwt.config'

it('Uses the ENV vars to setup the jwt options', async () => {
  const module: TestingModule = await Test.createTestingModule({ imports: [ConfigService] }).compile()

  const configService = module.get(ConfigService)

  const getSpy = jest.spyOn(configService, 'get').mockImplementation((thingToGet: string) => {
    return { JWT_SECRET: 'secret', JWT_DEFAULT_TTL: 'ttl' }[thingToGet]
  })

  const config = await jwtConfig.useFactory(configService)

  expect(configService.get).toHaveBeenCalledTimes(2)
  expect(config).toEqual({ secret: 'secret', signOptions: { expiresIn: 'ttl' } })
  expect(getSpy.mock.calls[0][0]).toBe('JWT_SECRET')
  expect(getSpy.mock.calls[1][0]).toBe('JWT_DEFAULT_TTL')
})
