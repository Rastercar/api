import { MongoDriver } from '@mikro-orm/mongodb'
import { registerAs } from '@nestjs/config'
import { Options } from '@mikro-orm/core'

const getMongoConfig = registerAs('mongo', (): Options<MongoDriver> => {
  // Important: only destruct env vars inside this function as they would be read at run time and not at module registration !
  const { MONGO_DB, MONGO_HOST, MONGO_USER, MONGO_PASSWORD, MONGO_DEBUG_MODE } = process.env

  return {
    type: 'mongo',
    debug: MONGO_DEBUG_MODE === 'true',
    dbName: MONGO_DB ?? 'db',
    clientUrl: `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/`
  }
})

export default getMongoConfig
