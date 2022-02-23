import { Entity, EntityRepositoryType, ManyToOne, OneToOne, Property, Unique } from '@mikro-orm/core'
import { Organization } from '../../organization/entities/organization.entity'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { UserRepository } from '../repositories/user.repository'
import { BaseEntity } from '../../../database/base/base-entity'

interface UserArgs {
  username: string
  password: string

  email: string
  emailVerified: boolean

  googleProfileId: string | null

  accessLevel: AccessLevel
  organization: Organization
}

@Entity({ customRepository: () => UserRepository })
export class User extends BaseEntity {
  /**
   * A user representing a tracker client, the user might be a direct client
   * to the tracking service, owning a billable organization or he might be
   * just a user with access but no ownership of a organization.
   */
  constructor(data: UserArgs) {
    super()

    this.username = data.username
    this.password = data.password

    this.email = data.email
    this.emailVerified = data.emailVerified

    this.googleProfileId = data.googleProfileId

    this.accessLevel = data.accessLevel
    this.organization = data.organization
  }

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
   * and will only be populated with `populate: true` or `populate: ['password']`
   */
  @Property({ lazy: true })
  password?: string

  /**
   * ID of the google profile associated with the user,
   * that can be user to login using OAUTH
   */
  @Property({ type: String, nullable: true })
  @Unique()
  googleProfileId!: string | null

  /**
   * Relationship: N...1
   *
   * The organization which the user belongs to and might own.
   */
  @ManyToOne(() => Organization)
  organization!: Organization

  /**
   * Relationship: N...1
   *
   * The access level of the user
   */
  @ManyToOne(() => AccessLevel)
  accessLevel!: AccessLevel

  /**
   * Relationship: 1 - 0...1
   *
   * The organization which the user owns, a user can own a single or no organization
   */
  @OneToOne({ mappedBy: (org: Organization) => org.owner, entity: () => Organization, nullable: true })
  ownedOrganization!: Organization | null
}
