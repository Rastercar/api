import { Entity, EntityRepositoryType, OneToMany, Property, Unique } from '@mikro-orm/core'
import { Organization } from '../../organization/entities/organization.entity'
import { oauthProvider } from '../../auth/constants/oauth-providers'
import { UserRepository } from '../repositories/user.repository'
import { BaseEntity } from '../../../database/base/base-entity'

interface UserArgs {
  username: string
  password: string

  email: string
  emailVerified: boolean

  oauthProvider: oauthProvider | null
  oauthProfileId: string | null
}

@Entity()
export class User extends BaseEntity {
  [EntityRepositoryType]?: UserRepository

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
   * The slug for the oauth provider
   */
  @Property({ type: String, nullable: true })
  oauthProvider!: oauthProvider | null

  /**
   * The third party profile identifier for the authentication provider in oauthProvider
   */
  @Property({ type: String, nullable: true })
  oauthProfileId!: string | null

  /**
   * Relationship: 1 - 1...N
   *
   * All organizations currently owned by the user, a user might own many orgs but a org has only one owner
   */
  @OneToMany({ mappedBy: (org: Organization) => org.owner, entity: () => Organization })
  ownedOrganizations!: Organization

  constructor(data: UserArgs) {
    super()

    this.username = data.username
    this.password = data.password

    this.email = data.email
    this.emailVerified = data.emailVerified

    if ((data.oauthProfileId && !data.oauthProvider) || (!data.oauthProfileId && data.oauthProvider)) {
      throw new Error('Cannot create user, either inform oauth_profile_id AND oauth_provider or none')
    }

    this.oauthProvider = data.oauthProvider
    this.oauthProfileId = data.oauthProfileId
  }
}
