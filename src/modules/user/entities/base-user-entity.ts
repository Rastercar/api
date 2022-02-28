import { BaseEntity } from '../../../database/base/base-entity'
import { Property, Unique } from '@mikro-orm/core'

export abstract class BaseUser extends BaseEntity {
  /**
   * The display name
   */
  @Property()
  username!: string

  /**
   * Timestamp of the user last login
   */
  @Property({ nullable: true })
  lastLogin!: Date

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
  @Property({ default: false })
  emailVerified!: boolean

  /**
   * Note: marked as optional for convenience, column is not nullable
   */
  @Property()
  password?: string

  /**
   * A JWT for reseting passwords, this token is stored here as a security measure to
   * avoid any valid token to be able to permit a password redefinition, also the token
   * should be short lived and replaced anytime a new one is generated
   */
  @Property({ type: String, nullable: true })
  resetPasswordToken?: string | null
}
