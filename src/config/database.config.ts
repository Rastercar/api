import { registerAs } from '@nestjs/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// If there is no NODE_ENV this means we are loading the config for the mikro-orm
// CLI which means nest did not parse the env files for us and were in develpment mode
if (!process.env.NODE_ENV) config({ path: resolve('env', '.development.env') })

const getDatabaseConfig = registerAs('database', () => ({
  port: parseInt(process.env.PORT ?? '5432', 10),
  dbName: process.env.POSTGRES_DB ?? 'db',
  type: process.env.DB_TYPE ?? 'postgresql',

  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',

  debug: process.env.DB_DEBUG_MODE === 'true'
}))

export default getDatabaseConfig
