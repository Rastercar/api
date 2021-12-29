import { Entity, EntityRepositoryType, OneToMany, Property, Unique } from '@mikro-orm/core'
import { oauthProvider } from '../../auth/constants/oauth-providers'
import { UserRepository } from '../repositories/user.repository'
import { BaseEntity } from '../../../database/base/base-entity'
import { Organization } from '../../organization/entities/organization.entity'

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
}
