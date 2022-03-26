import { Point, Position } from './position.entity'
import { EntityManager } from '@mikro-orm/mongodb'
import DataLoader from 'dataloader'

export interface TrackerLastPosition {
  /**
   * The trackerId
   */
  _id: number
  point: Point
  createdAt: Date
  recievedAt: Date
}

/**
 * Creates a data loader for the most recent position for a tracker id.
 *
 * ```ts
 *
 * const lastTrackerPosition = await createLastPositionByTrackerIdLoader(em).load(trackerId)
 * ```
 */
export const createLastPositionByTrackerIdLoader = (em: EntityManager) => {
  return new DataLoader(async (ids: readonly number[]) => {
    const trackersLastPosition: TrackerLastPosition[] = await em.aggregate(Position, [
      // filter the positions that do not belong to the tracker on the ids
      { $match: { trackerId: { $in: ids } } },
      // Order by tracker id asc, and by date desc
      { $sort: { trackerId: 1, createdAt: -1 } },
      // Group by tracker id and for each group return the first position
      {
        $group: {
          _id: '$trackerId',
          point: { $first: '$point' },
          trackerId: { $first: '$trackerId' },
          createdAt: { $first: '$createdAt' },
          recievedAt: { $first: '$recievedAt' }
        }
      }
    ])

    const mapKeys = trackersLastPosition.map(lastPosition => [lastPosition._id, lastPosition])

    const map = new Map(mapKeys as any)

    return ids.map(id => map.get(id) ?? null) as TrackerLastPosition[]
  })
}
