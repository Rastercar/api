import { Organization } from '../../modules/organization/entities/organization.entity'
import { SimCard } from '../../modules/sim-card/sim-card.entity'
import { Tracker } from '../../modules/tracker/tracker.entity'
import { Vehicle } from '../../modules/vehicle/vehicle.entity'
import { User } from '../../modules/user/entities/user.entity'
import { AnyEntity, EntityName } from '@mikro-orm/core'
import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { AccessLevel } from '../../modules/auth/entities/access-level.entity'

export interface IDataLoaders {
  tracker: {
    byId: DataLoader<number, Tracker, number>
    bySimCardId: DataLoader<number, Tracker, number>
    byVehicleId: DataLoader<number, Tracker[], number>
    byOrganizationId: DataLoader<number, Tracker[], number>
  }
  vehicle: {
    byId: DataLoader<number, Vehicle, number>
    byTrackerId: DataLoader<number, Vehicle, number>
    byOrganizationId: DataLoader<number, Vehicle[], number>
  }
  simCard: {
    byId: DataLoader<number, SimCard, number>
    byTrackerId: DataLoader<number, SimCard[], number>
    byOrganizationId: DataLoader<number, SimCard[], number>
  }
  organization: {
    byId: DataLoader<number, Organization, number>
  }
  user: {
    byId: DataLoader<number, User, number>
    byOrganizationId: DataLoader<number, User[], number>
  }
  accessLevel: {
    byId: DataLoader<number, AccessLevel, number>
    byUserId: DataLoader<number, AccessLevel, number>
  }
}

@Injectable()
export class DataloaderService {
  constructor(
    @InjectEntityManager('postgres')
    readonly em: EntityManager
  ) {}

  /**
   * Creates a dict where the keys are the array values and the values are empty arrays
   */
  private createDictForArray(array: number[]) {
    return array.reduce((acc: Record<string, unknown>, c) => ({ ...acc, [c]: [] }), {})
  }

  /**
   * Creates a data loader to load entities by id
   *
   * **NOTE:** NOT TYPE SAFE, this expects the entity to have a `id` PK
   */
  createByIdLoader<T extends AnyEntity<T>>(entity: EntityName<T>): DataLoader<number, T, number> {
    return new DataLoader(async (ids: readonly number[]) => {
      const entities = await this.em.find(entity, { id: [...ids] } as any)

      const mapKeys = entities.map((entity: any) => [entity.id, entity])

      const map = new Map(mapKeys as any)

      return ids.map(id => map.get(id) ?? null) as T[]
    })
  }

  /**
   * Creates a data loader that fetches a given entity by its parent id,
   * usefull for N to 1 relationships where the parent has many instances
   * of the child and child has only one parent
   *
   * ```ts
   * // example: this data loader would accept ids of vehicles (parent) and return their trackers
   * const trackerByVehicleIdLoader = createByParentIdLoader(Tracker, 'vehicle')
   * ```
   */
  createByParentIdLoader<T extends AnyEntity<T>>(en: EntityName<T>, parentKey: keyof T): DataLoader<number, T[], number> {
    return new DataLoader(async (ids: readonly number[]) => {
      const mutIds = [...ids]
      const entities = await this.em.find(en, { [parentKey]: { id: mutIds } } as any)

      const dict: Record<number, typeof entities> = this.createDictForArray(mutIds)

      entities.forEach(e => {
        if (e[parentKey]?.id) dict[e[parentKey].id].push(e)
      })

      return ids.map(id => dict[id]) as T[][]
    })
  }

  /**
   * Creates a data loader that fetches a given entity by its child ids,
   * usefull for 1 to N relationships where the parent has one child and
   * the child has many parents
   *
   * ```ts
   * // example: this data loader would accept ids of trackers (child) and return its vehicles
   * const vehicleByTrackerIdLoader = createByChildIdLoader(Vehicle, 'trackers')
   * ```
   */
  createByChildIdLoader<T extends AnyEntity<T>>(en: EntityName<T>, childKey: keyof T): DataLoader<number, T, number> {
    return new DataLoader(async (childIds: readonly number[]) => {
      const mutIds = [...childIds]

      const entities = await this.em.find(en, { [childKey]: { id: mutIds } } as any, { populate: [childKey] } as any)

      // key: childId, value: (parent | null)
      const childIdsToParent: Record<number, typeof entities[number] | null> = childIds.reduce(
        (acc: Record<string, unknown>, c) => ({ ...acc, [c]: null }),
        {}
      )

      entities.forEach(entity => {
        entity[childKey].getItems().forEach(child => {
          childIdsToParent[child.id] = entity
        })
      })

      return childIds.map(vehicleId => childIdsToParent[vehicleId])
    })
  }

  /**
   * Create all dataloaders that might be used for the request
   */
  createLoaders(): IDataLoaders {
    return {
      tracker: {
        byId: this.createByIdLoader(Tracker),
        bySimCardId: this.createByChildIdLoader(Tracker, 'simCards'),
        byVehicleId: this.createByParentIdLoader(Tracker, 'vehicle'),
        byOrganizationId: this.createByParentIdLoader(Tracker, 'organization')
      },
      vehicle: {
        byId: this.createByIdLoader(Vehicle),
        byTrackerId: this.createByChildIdLoader(Vehicle, 'trackers'),
        byOrganizationId: this.createByParentIdLoader(Vehicle, 'organization')
      },
      simCard: {
        byId: this.createByIdLoader(SimCard),
        byTrackerId: this.createByParentIdLoader(SimCard, 'tracker'),
        byOrganizationId: this.createByParentIdLoader(SimCard, 'organization')
      },
      organization: {
        byId: this.createByIdLoader(Organization)
      },
      user: {
        byId: this.createByIdLoader(User),
        byOrganizationId: this.createByParentIdLoader(User, 'organization')
      },
      accessLevel: {
        byId: this.createByIdLoader(AccessLevel),
        byUserId: this.createByChildIdLoader(AccessLevel, 'users')
      }
    }
  }
}
