import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { PermissionRepository } from '../repositories/permission.repository'

interface PermissionArgs {
  name: string
  description: string
}

@Entity({ customRepository: () => PermissionRepository })
export class Permission {
  /**
   * A permission for access levels, a permission is used by many
   * access levels and a access level has many permissions
   */
  constructor(data: PermissionArgs) {
    this.name = data.name
    this.description = data.description
  }

  [EntityRepositoryType]?: PermissionRepository

  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property()
  description!: string
}
