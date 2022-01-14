import { HealthcheckController } from './healthcheck.controller'
import { Test, TestingModule } from '@nestjs/testing'

describe('HealthcheckController', () => {
  let controller: HealthcheckController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ controllers: [HealthcheckController] }).compile()

    controller = module.get(HealthcheckController)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  it('[healthcheck] just responds with a ok message', () => {
    expect(controller.getHealthcheck()).toBe('ok')
  })
})
