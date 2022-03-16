import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { Entity, EntityRepositoryType, Property } from '@mikro-orm/core'
import { UuidBaseEntity } from '../../../database/postgres/base/uuid-base-entity'
import { oauthProvider } from '../../auth/constants/oauth-providers'

interface UnregisteredUserArgs {
  username?: string

  email?: string
  emailVerified?: boolean

  oauthProvider: oauthProvider
  oauthProfileId: string
}

@Entity({ customRepository: () => UnregisteredUserRepository })
export class UnregisteredUser extends UuidBaseEntity {
  /**
   * A unregistered user represents a incomplete or not fully registered user, it cannot
   * be used to login to the plataform or basically do anything at all, it is created when
   * someone logins using oauth for the first time.
   *
   * Its used to suggest profile autocompletion for the new user to be registered for the
   * oauth provider and keeping track of users who did not finish their registration.
   */
  constructor(data: UnregisteredUserArgs) {
    super()

    this.username = data.username ?? null

    this.email = data.email ?? null
    this.emailVerified = data.emailVerified ?? false
    this.oauthProvider = data.oauthProvider
    this.oauthProfileId = data.oauthProfileId
  }

  [EntityRepositoryType]?: UnregisteredUserRepository

  @Property({ type: String, nullable: true })
  username!: string | null

  @Property({ type: String, nullable: true })
  email!: string | null

  @Property({ default: false })
  emailVerified!: boolean

  /**
   * The slug for the oauth provider
   */
  @Property({ type: String })
  oauthProvider!: oauthProvider

  /**
   * The third party profile identifier for the authentication provider in oauthProvider
   */
  @Property({ type: String })
  oauthProfileId!: string
}
