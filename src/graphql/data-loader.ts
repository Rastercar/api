import { AnyEntity, EntityName } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import * as DataLoader from 'dataloader'

/**
 * Creates a dict where the keys are the array values and the values are empty arrays
 */
function createDictForArray(array: number[]) {
  return array.reduce((acc: Record<string, unknown>, c) => ({ ...acc, [c]: [] }), {})
}

/**
 * Creates a data loader to load entities by id
 *
 * **NOTE:** NOT TYPE SAFE, this expects the entity to have a `id` PK
 */
export function createByIdLoader<T>(entity: EntityName<T>, em: EntityManager) {
  return new DataLoader(async (ids: readonly number[]) => {
    const entities = await em.find(entity, { id: [...ids] } as any)

    const mapKeys = entities.map((entity: any) => [entity.id, entity])

    const map = new Map(mapKeys as any)

    return ids.map(id => map.get(id) ?? null)
  })
}

/**
 * Creates a data loader that fetches a given entity by its parent id,
 * usefull for N to 1 relationships where the parent has many instances
 * of the child and child has only one parent
 *
 * ```ts
 * // example: this data loader would accept ids of vehicles (parent) and return their trackers
 * const trackerByVehicleIdLoader = createByParentIdLoader(Tracker, this.em, 'vehicle')
 * ```
 */
export function createByParentIdLoader<T extends AnyEntity<T>>(
  en: EntityName<T>,
  em: EntityManager,
  parentKey: keyof T
): DataLoader<number, T[], number> {
  return new DataLoader(async (ids: readonly number[]) => {
    const mutIds = [...ids]
    const entities = await em.find(en, { [parentKey]: { id: mutIds } } as any)

    const dict: Record<number, typeof entities> = createDictForArray(mutIds)

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
 * const vehicleByTrackerIdLoader = createByChildIdLoader(Vehicle, this.em, 'trackers')
 * ```
 */
export function createByChildIdLoader<T extends AnyEntity<T>>(en: EntityName<T>, em: EntityManager, childKey: keyof T) {
  return new DataLoader(async (childIds: readonly number[]) => {
    const mutIds = [...childIds]

    const entities = await em.find(en, { [childKey]: { id: mutIds } } as any, { populate: [childKey] } as any)

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
