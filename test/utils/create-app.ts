import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'

/**
 * Compiles a testing module with the entire aplication for e2e testing purposes
 *
 * HINT: dont forget to call app.close() after all tests
 *
 * @param options.init - if the testModule should be started before returning, default: true
 */
export const createAppTestingModule = async (options = { init: true }) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()

  const app = moduleFixture.createNestApplication()

  if (options.init) await app.init()

  return app
}
