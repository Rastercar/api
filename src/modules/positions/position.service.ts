import { PositionRepository } from './position.repository'
import { Position } from './position.entity'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/mongodb'

@Injectable()
export class PositionService {
  constructor(
    readonly positionRepository: PositionRepository,
    // TODO: REMOVE ME and use repository after removing main call
    @InjectEntityManager('mongo') readonly em: EntityManager
  ) {}

  async registerMockPosition(trackerId: number, coordinates: [number, number]) {
    const pos = new Position({
      trackerId,
      createdAt: new Date(),
      coordinates
    })

    await this.em.fork().persistAndFlush(pos)

    return pos
  }

  /**
   * Gets all positions near a coordinate
   *
   * TODO: REMOVE ME
   */
  async fetchTest(lat = 40, lng = 60) {
    return this.positionRepository.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lat, lng] },
          spherical: true,
          query: { category: 'Parks' },
          distanceField: 'calcDistance'
        }
      }
    ])
  }
}
