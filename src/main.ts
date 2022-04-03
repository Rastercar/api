import { TrackerService } from './modules/tracker/tracker.service'
import { ConfigService } from '@nestjs/config'
import {
  addMikroOrmRequestContextMiddleware,
  updateMongoDbSchema,
  setupAppGlobals,
  updateAwsConfig,
  createApp,
  initApp
} from './bootstrap/setup-app'

async function bootstrap() {
  const app = await createApp()

  const inProduction = app.get(ConfigService).get('NODE_ENV') === 'production'

  // If we enable shutdown hooks in development, hot reloading will shutdown the
  // apolloGraphql server completely on file change, making it a pain work with
  // apollo studio and the graphql playground
  if (inProduction) app.enableShutdownHooks()

  setupAppGlobals(app)

  addMikroOrmRequestContextMiddleware(app)

  updateAwsConfig(app)

  await updateMongoDbSchema(app)

  await initApp(app)

  // TODO: remove me
  setInterval(() => app.get(TrackerService).mockTransmissions(), 25000)
}

bootstrap()
