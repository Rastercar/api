import { Entity, EntityRepositoryType, ManyToOne, OneToOne, Property, Unique } from '@mikro-orm/core'
import { Organization } from '../../organization/entities/organization.entity'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { UserRepository } from '../repositories/user.repository'
import { BaseUser } from './base-user-entity'

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
export class User extends BaseUser {
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
