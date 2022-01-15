import { clearDatabase } from '../database/clear-database'
import { loadFixtures } from '../database/load-fixtures'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { MikroORM } from '@mikro-orm/core'

interface Options {
  init?: boolean
  loadFixtures?: boolean
  clearDatabase?: boolean
}

/**
 * Compiles a testing module with the entire aplication for e2e testing purposes
 *
 * HINT: dont forget to call app.close() after all tests
 *
 * @param options.init - if the server should be started, default: true
 * @param options.loadFixtures - if mockData should be inserted into the database, default: true
 * @param options.clearDatabase - if the database should be cleared before loading fixtures, default: true
 */
export const createAppTestingModule = async (opts: Options = {}) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()

  const app = moduleFixture.createNestApplication()

  const defailtOptions = { init: true, clearDatabase: true, loadFixture: true }
  const options = { ...defailtOptions, ...opts }

  if (options.init) await app.init()

  if (options.clearDatabase || options.loadFixtures) {
    const orm = app.get(MikroORM)

    if (options.clearDatabase) await clearDatabase(orm)
    if (options.loadFixtures) await loadFixtures(orm)
  }

  return app
}
