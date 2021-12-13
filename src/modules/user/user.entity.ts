import { Entity, EntityRepositoryType, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base/base-entity'
import { UserRepository } from './user.repository'

@Entity()
export class User extends BaseEntity {
  [EntityRepositoryType]?: UserRepository

  /**
   * The display name of the user
   */
  @Property()
  username!: string

  /**
   * Unique email address, if a users uses oauth for authentication
   * this email is still used and might differ from the oauth provider
   * email, as the user might want another email address to use within
   * our aplication
   */
  @Property()
  @Unique()
  email!: string

  /**
   * If the user has verified his email address
   */
  @Property()
  emailVerified!: boolean

  /**
   * Note: marked as optional for convenience, column is not nullable
   */
  @Property()
  password?: string

  /**
   * The profile id of the user google account, used only if the user registered
   * through google oauth2
   */
  @Property({ nullable: true })
  googleProfileId?: string
}
