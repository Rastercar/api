import getMongoConfig from '../../config/mongo.config'
import type { MongoDriver } from '@mikro-orm/mongodb'
import { Options } from '@mikro-orm/core'
import { entities } from './entities'

const mongoConfig: Options<MongoDriver> = {
  ...getMongoConfig(),

  migrations: {
    path: './src/database/mongo/migrations'
  },

  seeder: {
    path: './src/database/mongo/seeders',
    defaultSeeder: 'DatabaseSeeder'
  },

  allowGlobalContext: false,

  entities: entities
}

export default mongoConfig
