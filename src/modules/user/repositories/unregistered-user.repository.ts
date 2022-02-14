import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { EntityRepository } from '@mikro-orm/postgresql'

export class UnregisteredUserRepository extends EntityRepository<UnregisteredUser> {}
