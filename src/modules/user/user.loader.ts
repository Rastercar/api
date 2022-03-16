import { createByParentIdLoader, createByIdLoader } from '../../graphql/data-loader'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { User } from './entities/user.entity'
import { InjectEntityManager } from '@mikro-orm/nestjs'

@Injectable({ scope: Scope.REQUEST })
export default class UserLoader {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  byId = createByIdLoader(User, this.em)

  byOrganizationId = createByParentIdLoader(User, this.em, 'organization')
}
