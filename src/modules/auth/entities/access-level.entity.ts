import { Collection, Entity, EntityRepositoryType, ManyToMany, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import { AccessLevelRepository } from '../repositories/access-level.repository'
import { Organization } from '../../organization/entities/organization.entity'
import { BaseEntity } from '../../../database/base/base-entity'
import { User } from '../../user/entities/user.entity'
import { Permission } from './permission.entity'

interface AccessLevelArgs {
  name: string
  isFixed: boolean
  description: string
  organization: Organization
}

@Entity()
export class AccessLevel extends BaseEntity {
  /**
   * A access level for tracked users, contains 0-N permissions
   */
  constructor(data: AccessLevelArgs) {
    super()

    this.name = data.name
    this.isFixed = data.isFixed
    this.description = data.description
    this.organization = data.organization
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
   * Relationship 1...0-N
   *
   * The users that have this access level
   */
  @OneToMany({ entity: () => User, mappedBy: user => user.accessLevel })
  users = new Collection<User>(this)

  /**
   * Relationship: N...1
   *
   * The organization that created/owns the access level
   */
  @ManyToOne(() => Organization)
  organization!: Organization

  /**
   * Relationship: N...N
   *
   *  organization that created/owns the access level
   */
  @ManyToMany(() => Permission)
  permissions: Collection<Permission> = new Collection<Permission>(this)
}
