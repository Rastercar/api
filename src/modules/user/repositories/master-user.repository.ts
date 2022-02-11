import { MasterUser } from '../entities/master-user.entity'
import { EntityRepository } from '@mikro-orm/postgresql'

export class MasterUserRepository extends EntityRepository<MasterUser> {}
