import { EntityRepository } from '@mikro-orm/postgresql'
import { Repository } from '@mikro-orm/core'
import { User } from './user.entity'

@Repository(User)
export class UserRepository extends EntityRepository<User> {}
