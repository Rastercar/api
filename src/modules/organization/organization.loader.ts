import { createByIdLoader } from '../../graphql/data-loader'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { Organization } from './entities/organization.entity'

@Injectable({ scope: Scope.REQUEST })
export default class OrganizationLoader {
  constructor(readonly em: EntityManager) {}

  byId = createByIdLoader(Organization, this.em)
}
