import getMongoConfig from '../../config/mongo.config'
import type { MongoDriver } from '@mikro-orm/mongodb'
import { Options } from '@mikro-orm/core'
import { entities } from './entities'

const mongoConfig: Options<MongoDriver> = {
  ...getMongoConfig(),

  seeder: {
    path: './src/database/mongo/seeders',
    defaultSeeder: 'DatabaseSeeder'
  },

  entities: entities,

  ensureIndexes: true,

  allowGlobalContext: false
}

export default mongoConfig
