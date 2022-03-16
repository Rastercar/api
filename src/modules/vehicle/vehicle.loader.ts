import { createByParentIdLoader, createByIdLoader, createByChildIdLoader } from '../../graphql/data-loader'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Scope } from '@nestjs/common'
import { Vehicle } from './vehicle.entity'
import { InjectEntityManager } from '@mikro-orm/nestjs'

@Injectable({ scope: Scope.REQUEST })
export default class VehicleLoader {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  byId = createByIdLoader(Vehicle, this.em)

  byTrackerId = createByChildIdLoader(Vehicle, this.em, 'trackers')

  byOrganizationId = createByParentIdLoader(Vehicle, this.em, 'organization')
}
