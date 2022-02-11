import { MasterAccessLevel } from '../entities/master-access-level.entity'
import { EntityRepository } from '@mikro-orm/postgresql'

export class MasterAccessLevelRepository extends EntityRepository<MasterAccessLevel> {}
