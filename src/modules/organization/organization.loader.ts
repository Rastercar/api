import { OrganizationRepository } from './repositories/organization.repository'
import { createByIdLoader } from '../../graphql/data-loader.utils'
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export default class OrganizationLoader {
  constructor(readonly organizationRepository: OrganizationRepository) {}

  byId = createByIdLoader(this.organizationRepository)
}
