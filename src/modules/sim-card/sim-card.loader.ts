import { createByParentIdLoader, createByIdLoader } from '../../graphql/data-loader'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { SimCard } from './sim-card.entity'

@Injectable({ scope: Scope.REQUEST })
export default class SimCardLoader {
  constructor(readonly em: EntityManager) {}

  byId = createByIdLoader(SimCard, this.em)

  byTrackerId = createByParentIdLoader(SimCard, this.em, 'tracker')

  byOrganizationId = createByParentIdLoader(SimCard, this.em, 'organization')
}
