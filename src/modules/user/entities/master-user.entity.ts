import { Entity, EntityRepositoryType, ManyToOne, Property, Unique } from '@mikro-orm/core'
import { MasterAccessLevel } from '../../auth/entities/master-access-level.entity'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { BaseEntity } from '../../../database/base/base-entity'

interface MasterUserArgs {
  username: string
  password: string

  email: string
  emailVerified: boolean

  accessLevel: AccessLevel
  masterAccessLevel: MasterAccessLevel
}

@Entity({ customRepository: () => MasterUserRepository })
export class MasterUser extends BaseEntity {
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

    this.accessLevel = data.accessLevel
    this.masterAccessLevel = data.masterAccessLevel
  }

  [EntityRepositoryType]?: MasterUserRepository

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
   * Unique email address
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
   * A JWT for reseting passwords, this token is stored here as a security measure to
   * avoid any valid token to be able to permit a password redefinition, also the token
   * should be short lived and replaced anytime a new one is generated
   */
  @Property({ type: String, nullable: true })
  resetPasswordToken?: string | null

  /**
   * Relationship: N...1
   *
   * The access level of the user in regards to edit other users, if null this
   * master user cannot edit/manage its clients on using the tracked dashboard
   */
  @ManyToOne(() => AccessLevel, { nullable: true })
  accessLevel!: AccessLevel

  /**
   * Relationship: N...0-1
   *
   * The master access level of the user, limiting his actions on the tracked dashboard
   */
  @ManyToOne(() => MasterAccessLevel)
  masterAccessLevel!: MasterAccessLevel
}
