import type { MongoDriver } from '@mikro-orm/mongodb'
import { Entity, Options, PrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb'

@Entity()
class Meme {
  @PrimaryKey()
  _id!: ObjectId
}

export const mongoConfig: Options<MongoDriver> = {
  dbName: 'rastercar',
  type: 'mongo',
  entities: [Meme]
}
