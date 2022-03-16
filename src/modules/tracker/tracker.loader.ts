import { createByParentIdLoader, createByIdLoader, createByChildIdLoader } from '../../graphql/data-loader'
import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { Tracker } from './tracker.entity'

@Injectable({ scope: Scope.REQUEST })
export default class TrackerLoader {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  byId = createByIdLoader(Tracker, this.em)

  bySimCardId = createByChildIdLoader(Tracker, this.em, 'simCards')

  byVehicleId = createByParentIdLoader(Tracker, this.em, 'vehicle')

  byOrganizationId = createByParentIdLoader(Tracker, this.em, 'organization')
}
