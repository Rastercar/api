import { Collection, Entity, EntityRepositoryType, Enum, OneToMany, Property } from '@mikro-orm/core'
import { MasterAccessLevelRepository } from '../repositories/master-access-level.repository'
import { MasterUser } from '../../user/entities/master-user.entity'
import { BaseEntity } from '../../../database/base/base-entity'
import { MASTER_PERMISSION } from '../constants/permissions'

interface MasterAccessLevelArgs {
  name: string
  isFixed: boolean
  description: string
  permissions: MASTER_PERMISSION[]
}

@Entity({ customRepository: () => MasterAccessLevelRepository })
export class MasterAccessLevel extends BaseEntity {
  /**
   * A access level for tracker users, contains 0-N master permissions
   */
  constructor(data: MasterAccessLevelArgs) {
    super()

    this.name = data.name
    this.isFixed = data.isFixed
    this.description = data.description
    this.permissions = data.permissions
  }

  [EntityRepositoryType]?: MasterAccessLevelRepository

  @Property()
  name!: string

  @Property()
  description!: string

  /**
   * If the master access level is fixed and cannot be edited by anyone, a fixed
   * master access level is normally the master access level of the tracker owner
   */
  @Property()
  isFixed!: boolean

  /**
   * All the permissions of the master access level
   */
  @Enum({ items: () => MASTER_PERMISSION, array: true, default: [] })
  permissions!: MASTER_PERMISSION[]

  /**
   * Relationship 1...0-N
   *
   * The master users that have this master access level
   */
  @OneToMany({ entity: () => MasterUser, mappedBy: masterUser => masterUser.masterAccessLevel })
  users = new Collection<MasterUser>(this)
}
