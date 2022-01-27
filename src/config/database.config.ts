import { registerAs } from '@nestjs/config'
import { Options } from '@mikro-orm/core'
import { config } from 'dotenv'
import { resolve } from 'path'

const { NODE_ENV, MIKRO_ORM_CFG } = process.env

const isRunningMikroOrmCliWithoutSpecifiedEnv = !NODE_ENV && !MIKRO_ORM_CFG

// If this file is being used to load the config when running the mikroorm cli
// this means nest did not parse the env files for us so we load the dev config
// unless other config was stated by MIKRO_ORM_CFG
if (isRunningMikroOrmCliWithoutSpecifiedEnv) config({ path: resolve('env', '.development.env') })

if (MIKRO_ORM_CFG) config({ path: resolve('env', `.${MIKRO_ORM_CFG}.env`) })

const getDatabaseConfig = registerAs('database', (): Options => {
  // Important: only destruct env vars inside this function as they would be read at run time and not at module registration !
  const { POSTGRES_DB, DB_PORT, DB_HOST, POSTGRES_USER, POSTGRES_PASSWORD, DB_DEBUG_MODE } = process.env

  return {
    type: 'postgresql',

    dbName: POSTGRES_DB ?? 'db',

    port: parseInt(DB_PORT ?? '5432', 10),
    host: DB_HOST ?? 'localhost',

    user: POSTGRES_USER ?? 'postgres',
    password: POSTGRES_PASSWORD ?? 'postgres',

    debug: DB_DEBUG_MODE === 'true'
  }
})

export default getDatabaseConfig
