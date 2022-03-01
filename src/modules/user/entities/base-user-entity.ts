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
  @Property({ lazy: true })
  password?: string

  /*
   * TODO: FINISH ME IF NECESSARY
   *
   * A JWT for creating new accessTokens for the user, a refresh token has a long
   * expiration time and should be set only after a user successfully logs in.
   *
   * Why?: Since we do not want stolen tokens to allow access to protected resources
   * forever access tokens have a expiration time
   *
   *  +--------+                                           +---------------+
   *  |        |--(A)------- Authorization Grant --------->|               |
   *  |        |                                           |               |
   *  |        |<-(B)----------- Access Token -------------|               |
   *  |        |               & Refresh Token             |               |
   *  |        |                                           |               |
   *  |        |                            +----------+   |               |
   *  |        |--(C)---- Access Token ---->|          |   |               |
   *  |        |                            |          |   |               |
   *  |        |<-(D)- Protected Resource --| Resource |   | Authorization |
   *  | Client |                            |  Server  |   |     Server    |
   *  |        |--(E)---- Access Token ---->|          |   |               |
   *  |        |                            |          |   |               |
   *  |        |<-(F)- Invalid Token Error -|          |   |               |
   *  |        |                            +----------+   |               |
   *  |        |                                           |               |
   *  |        |--(G)----------- Refresh Token ----------->|               |
   *  |        |                                           |               |
   *  |        |<-(H)----------- Access Token -------------|               |
   *  +--------+                                           +---------------+
   *
   */
  // @Property({ type: String, nullable: true })
  // refreshToken?: string | null

  /**
   * A JWT for reseting passwords, this token is stored here as a security measure to
   * avoid any valid token to be able to permit a password redefinition, also the token
   * should be short lived and replaced anytime a new one is generated
   */
  @Property({ type: String, nullable: true, lazy: true })
  resetPasswordToken?: string | null
}
