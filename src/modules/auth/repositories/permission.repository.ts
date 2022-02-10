import { Permission } from '../entities/permission.entity'
import { EntityRepository } from '@mikro-orm/postgresql'

export class PermissionRepository extends EntityRepository<Permission> {}
