import { Collection, Entity, EntityRepositoryType, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import { AccessLevelRepository } from '../repositories/access-level.repository'
import { Organization } from '../../organization/entities/organization.entity'
import { BaseEntity } from '../../../database/base/base-entity'
import { User } from '../../user/entities/user.entity'
import { PERMISSION } from '../constants/permissions'

interface AccessLevelArgs {
  name: string
  isFixed?: boolean
  description: string
  organization?: Organization
  permissions: PERMISSION[]
}

@Entity({ customRepository: () => AccessLevelRepository })
export class AccessLevel extends BaseEntity {
  /**
   * A access level for tracked users, contains 0-N permissions
   */
  constructor(data: AccessLevelArgs) {
    super()

    this.name = data.name
    this.isFixed = data.isFixed ?? false
    this.description = data.description
    this.permissions = data.permissions
    this.organization = data.organization ?? null
  }

  [EntityRepositoryType]?: AccessLevelRepository

  @Property()
  name!: string

  @Property()
  description!: string

  /**
   * If the access level cannot be edited by any kind of user, ideally a organization has only
   * one fixed access level, containing all the permissions for said organization.
   */
  @Property()
  isFixed!: boolean

  /**
   * All the permissions of the access level
   *
   * disclaimer: permissions are not stored in a separate table
   * and related to the access_levels table because permissions
   * themselves are "static" (only devs can change them), so for
   * the sake of simplicity and performance they are stored here.
   *
   * If in the future we need to store them on a table, a simple
   * migration would be enough
   */
  @Enum({ items: () => PERMISSION, array: true, default: [] })
  permissions!: PERMISSION[]

  /**
   * Relationship 1...0-N
   *
   * The users that have this access level
   */
  @OneToMany({ entity: () => User, mappedBy: user => user.accessLevel })
  users = new Collection<User>(this)

  /**
   * Relationship: N...0-1
   *
   * The organization that created/owns the access level, if null this access
   * level was created and is used by master users to manage its clients
   */
  @ManyToOne(() => Organization, { nullable: true })
  organization!: Organization | null
}
