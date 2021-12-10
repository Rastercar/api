import { Entity, EntityRepositoryType, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base/base-entity'
import { UserRepository } from './user.repository'

@Entity()
export class User extends BaseEntity {
  [EntityRepositoryType]?: UserRepository

  @Property()
  username!: string

  /**
   * Note: marked as optional for convenience, column is not nullable
   */
  @Property()
  password?: string
}
