import { setupAppGlobals } from '../../src/bootstrap/setup-app'
import { clearDatabase } from '../database/clear-database'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import { seedDatabase } from '../database/seed-database'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'

interface Options {
  init?: boolean
  seed?: boolean
  clearDatabase?: boolean
}

/**
 * Compiles a testing module with the entire aplication for e2e testing purposes
 *
 * HINT: dont forget to call app.close() after all tests
 *
 * @param options.init - if the server should be started, default: true
 * @param options.seed - if mockData should be inserted into the database, default: true
 * @param options.clearDatabase - if the database should be cleared before loading fixtures, default: true
 */
export const createAppTestingModule = async (opts: Options = {}) => {
  const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()

  const app = moduleFixture.createNestApplication(undefined, { bodyParser: false })

  setupAppGlobals(app)

  const orm = app.get(MikroORM)

  // see: https://mikro-orm.io/docs/usage-with-nestjs/
  app.use((req: Express.Request, res: Express.Response, next: () => void) => {
    // storage.run(orm.em.fork({ useContext: true }), next)
    RequestContext.create(orm.em, next)
  })

  const defailtOptions = { init: true, clearDatabase: true, loadFixture: true }
  const options = { ...defailtOptions, ...opts }

  if (options.init) await app.init()

  if (options.clearDatabase) await clearDatabase(orm)
  if (options.seed) await seedDatabase(orm)

  return app
}
