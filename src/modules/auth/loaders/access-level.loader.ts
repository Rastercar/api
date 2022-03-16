import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { createByIdLoader, createByChildIdLoader } from '../../../graphql/data-loader'
import { AccessLevel } from '../entities/access-level.entity'

@Injectable({ scope: Scope.REQUEST })
export default class AccessLevelLoader {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  byId = createByIdLoader(AccessLevel, this.em)

  byUserId = createByChildIdLoader(AccessLevel, this.em, 'users')
}
