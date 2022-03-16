import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { registerAs } from '@nestjs/config'
import { Options } from '@mikro-orm/core'

const getPostgresConfig = registerAs('postgres', (): Options<PostgreSqlDriver> => {
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

export default getPostgresConfig
