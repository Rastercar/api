import { Entity, EntityRepositoryType, ManyToOne } from '@mikro-orm/core'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { MasterAccessLevel } from '../../auth/entities/master-access-level.entity'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { BaseUser } from './base-user-entity'

interface MasterUserArgs {
  username: string
  password: string

  email: string
  emailVerified: boolean

  accessLevel?: AccessLevel
  masterAccessLevel: MasterAccessLevel
}

@Entity({ customRepository: () => MasterUserRepository })
export class MasterUser extends BaseUser {
  /**
   * A user representing a manager, the user has access to the tracked
   * dashboard and might have access to edit and manage the tracker clients
   */
  constructor(data: MasterUserArgs) {
    super()

    this.username = data.username
    this.password = data.password

    this.email = data.email
    this.emailVerified = data.emailVerified

    this.accessLevel = data.accessLevel ?? null
    this.masterAccessLevel = data.masterAccessLevel
  }

  [EntityRepositoryType]?: MasterUserRepository

  /**
   * Relationship: N...1
   *
   * The access level of the user in regards to edit other users, if null this
   * master user cannot edit/manage its clients on using the tracked dashboard
   */
  @ManyToOne(() => AccessLevel, { nullable: true })
  accessLevel!: AccessLevel | null

  /**
   * Relationship: N...0-1
   *
   * The master access level of the user, limiting his actions on the tracked dashboard
   */
  @ManyToOne(() => MasterAccessLevel)
  masterAccessLevel!: MasterAccessLevel
}
