import { Entity, EntityRepositoryType, Index, PrimaryKey, Property } from '@mikro-orm/core'
import { PositionRepository } from './position.repository'
import { ObjectId } from '@mikro-orm/mongodb'

interface Point {
  type: 'Point'
  /**
   * lat, lng
   */
  coordinates: [number, number]
}

interface PositionArgs {
  coordinates: Point['coordinates']
}

@Entity({ customRepository: () => PositionRepository })
export class Position {
  constructor(args: PositionArgs) {
    this.point = { type: 'Point', coordinates: args.coordinates }
  }

  @PrimaryKey()
  _id!: ObjectId;

  [EntityRepositoryType]!: PositionRepository

  /**
   * https://docs.mongodb.com/manual/reference/geojson/#std-label-geojson-point
   */
  @Property()
  @Index({ type: '2dsphere' })
  point!: Point
}
