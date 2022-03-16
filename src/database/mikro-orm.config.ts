/*
 | This is the ORM config resolver for the mikro-orm cli, it just loads the
 | correct env file and and database configuration based on the env vars.
 |
 | Do not use this to resolve the mikro-orm configuration for the aplication
 | the config is directly loaded on `orm.module.ts`
 */
import { config } from 'dotenv'
import { resolve } from 'path'

const { MIKRO_ORM_CFG, MIKRO_ORM_DB } = process.env

config({ path: resolve('env', `.${MIKRO_ORM_CFG || 'development'}.env`) })

// IMPORTANT: only import these modules AFTER loading the enviroment variables
import postgres from './postgres/postgres.config'
import mongo from './mongo/mongo.config'

export default MIKRO_ORM_DB === 'mongo' ? mongo : postgres
