import { Collection, Entity, EntityRepositoryType, OneToMany, OneToOne, Property, Unique } from '@mikro-orm/core'
import { SoftDeletable } from '../../../database/postgres/filters/soft-deletable.decorator'
import { OrganizationRepository } from '../repositories/organization.repository'
import { BaseEntity } from '../../../database/postgres/base/base-entity'
import { User } from '../../user/entities/user.entity'
import { Tracker } from '../../tracker/tracker.entity'
import { SimCard } from '../../sim-card/sim-card.entity'
import { Vehicle } from '../../vehicle/vehicle.entity'

interface OrgArgs {
  name: string
  blocked?: boolean
  billingEmail: string
  billingEmailVerified: boolean
}

@SoftDeletable()
@Entity({ customRepository: () => OrganizationRepository })
export class Organization extends BaseEntity {
  /**
   * A organization representing a rastercar client, a organization has many
   * fleets, cars, trackers and users, but only one owner which is responsible
   * for it, including its billing.
   */
  constructor(data: OrgArgs) {
    super()

    this.name = data.name
    this.blocked = data.blocked ?? false
    this.billingEmail = data.billingEmail
    this.billingEmailVerified = data.billingEmailVerified
  }

  [EntityRepositoryType]?: OrganizationRepository

  /**
   * Informal display name
   */
  @Property()
  name!: string

  /**
   * If the org has been deleted, meaning its been permanently closed. Do not mistake for blocked clients
   */
  @Property({ type: Date, nullable: true })
  deletedAt?: Date | null = null

  /**
   * If the org has been blocked, for example due to payment issues
   */
  @Property()
  blocked!: boolean

  /**
   * Email address for billing, can be the same as the owner email adress or another one
   */
  @Property()
  @Unique()
  billingEmail!: string

  @Property({ default: false })
  billingEmailVerified!: boolean

  /**
   * Relationship: 1...1
   *
   * A user which owns the organization, a user owns one or zero orgs and a org is owned by a user
   *
   * Note: this field is marked as nullable because a user and its org are created simultaneously,
   * since users reference this table with the non nullable organization_id key, the organization
   * must be created first, making it impossible to informe the owner_id on creation.
   *
   * If by some error a org contains a null owner, the owner is the user of the lowest id associated
   * with the org.
   */
  @OneToOne({ entity: () => User, nullable: true })
  owner!: User | null

  /**
   * Relationship 1 - 1...N
   *
   * Users that belong to the organization
   */
  @OneToMany({ entity: () => User, mappedBy: user => user.organization })
  users = new Collection<User>(this)

  /**
   * Relationship 1 - 0...N
   *
   * Trackers that belong to the organization
   */
  @OneToMany({ entity: () => Tracker, mappedBy: tracker => tracker.organization })
  trackers = new Collection<Tracker>(this)

  /**
   * Relationship 1 - 0...N
   *
   * Sim Cards that belong to the organization
   */
  @OneToMany({ entity: () => SimCard, mappedBy: simCard => simCard.organization })
  simCards = new Collection<SimCard>(this)

  /**
   * Relationship 1 - 0...N
   *
   * Vehicles that belong to the organization
   */
  @OneToMany({ entity: () => Vehicle, mappedBy: vehicle => vehicle.organization })
  vehicles = new Collection<Vehicle>(this)
}
