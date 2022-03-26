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

  if (inProduction) app.enableShutdownHooks()

  setupAppGlobals(app)

  addMikroOrmRequestContextMiddleware(app)

  updateAwsConfig(app)

  await updateMongoDbSchema(app)

  await initApp(app)

  // TODO: remove me
  setInterval(() => app.get(TrackerService).mockTransmissions(), 2000)
}

bootstrap()
