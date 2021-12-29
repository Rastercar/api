import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { EntityRepository } from '@mikro-orm/postgresql'
import { Repository } from '@mikro-orm/core'

@Repository(UnregisteredUser)
export class UnregisteredUserRepository extends EntityRepository<UnregisteredUser> {}
