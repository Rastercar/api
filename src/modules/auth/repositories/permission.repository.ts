import { Permission } from '../entities/permission.entity'
import { EntityRepository } from '@mikro-orm/postgresql'
import { Repository } from '@mikro-orm/core'

@Repository(Permission)
export class PermissionRepository extends EntityRepository<Permission> {}
