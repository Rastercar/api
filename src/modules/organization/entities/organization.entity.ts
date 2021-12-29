import { Entity, EntityRepositoryType, ManyToOne, Property, Unique } from '@mikro-orm/core'
import { OrganizationRepository } from '../repositories/organization.repository'
import { BaseEntity } from '../../../database/base/base-entity'
import { User } from '../../user/entities/user.entity'

@Entity()
export class Organization extends BaseEntity {
  [EntityRepositoryType]?: OrganizationRepository

  /**
   * Informal display name
   */
  @Property()
  name!: string

  /**
   * Email address for billing, can be the same as the owner email adress or another one
   */
  @Property()
  @Unique()
  billingEmail!: string

  @Property({ default: false })
  billingEmailVerified!: boolean

  /**
   * Relationship: 1...N - 1
   *
   * A user which owns the organization, a user might own several orgs but a org is owned by a single user
   */
  @ManyToOne(() => User)
  owner!: User
}
