import { setupAppGlobals } from '../../src/bootstrap/setup-app'
import { clearDatabase } from '../database/clear-database'
import { loadFixtures } from '../database/load-fixtures'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { MikroORM } from '@mikro-orm/core'
import { storage } from '../../src/database/mikro-orm.config'

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

  setupAppGlobals(app)

  const defailtOptions = { init: true, clearDatabase: true, loadFixture: true }
  const options = { ...defailtOptions, ...opts }

  if (options.init) await app.init()

  const orm = app.get(MikroORM)

  if (options.clearDatabase) await clearDatabase(orm)
  if (options.loadFixtures) await loadFixtures(orm)

  // Yes this code is duplicated in main.js but this is because we cannot import the MikroORM class
  // elsewhere (in a exported function, for example) and use it here as that would trigger mikroorm to
  // load its configuration before the env variables were parsed !
  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    storage.run(orm.em.fork(true, true), next)
  })

  return app
}
