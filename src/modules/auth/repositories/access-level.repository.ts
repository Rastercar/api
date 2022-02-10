import { AccessLevel } from '../entities/access-level.entity'
import { EntityRepository } from '@mikro-orm/postgresql'
import { Repository } from '@mikro-orm/core'

@Repository(AccessLevel)
export class AccessLevelRepository extends EntityRepository<AccessLevel> {}
