import { AccessLevel } from '../entities/access-level.entity'
import { EntityRepository } from '@mikro-orm/postgresql'

export class AccessLevelRepository extends EntityRepository<AccessLevel> {}
