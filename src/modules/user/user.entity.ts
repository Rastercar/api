import { BaseEntity } from '../../database/base/base-entity'
import { Entity, Property } from '@mikro-orm/core'

@Entity()
export class User extends BaseEntity {
  @Property()
  username!: string

  @Property()
  password!: string
}
