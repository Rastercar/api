import { PositionRepository } from './position.repository'
import { Position } from './position.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PositionService {
  constructor(readonly positionRepository: PositionRepository) {}

  async createTest() {
    const pos = new Position({ coordinates: [40, 60] })

    await this.positionRepository.persistAndFlush(pos)

    return pos
  }

  async fetchTest() {
    return this.positionRepository.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [40, 60] },
          spherical: true,
          query: { category: 'Parks' },
          distanceField: 'calcDistance'
        }
      }
    ])
  }
}
