import { HealthcheckController } from './healthcheck.controller'
import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { createEmptyMocksFor } from '../../../test/utils/mocking'
import { PositionService } from '../positions/position.service'

describe('HealthcheckController', () => {
  let controller: HealthcheckController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
      providers: [...createEmptyMocksFor([PositionService])]
    }).compile()

    controller = module.get(HealthcheckController)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  it('[healthcheck] just responds with a ok message', () => {
    expect(controller.getHealthcheck()).toBe('ok')
  })

  describe('[showAllowedEnvVars]', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    it('Throws a UnauthorizedException if running in production', () => {
      process.env.NODE_ENV = 'production'
      expect(controller.showAllowedEnvVars).toThrow(UnauthorizedException)
    })

    it('Returns a object containing allowed env vars', () => {
      process.env.NODE_ENV = 'development'
      process.env.API_PORT = '3000'

      const envVars = controller.showAllowedEnvVars()

      expect(envVars['API_PORT']).toBeDefined()
    })

    it('Does not expose sensitive env vars', () => {
      process.env.NODE_ENV = 'development'
      const envVars = controller.showAllowedEnvVars()

      const sensitiveVars = [
        'JWT_SECRET',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'GOOGLE_OAUTH_CLIENT_ID',
        'GOOGLE_OAUTH_CLIENT_SECRET'
      ]

      const noSensitiveVarsWereReturned = sensitiveVars.every(variable => envVars[variable] === undefined)

      expect(noSensitiveVarsWereReturned).toBe(true)
    })
  })
})
