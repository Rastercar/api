import { Entity, PrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb'

@Entity()
export class Position {
  @PrimaryKey()
  _id!: ObjectId
}
