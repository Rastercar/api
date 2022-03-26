import { Entity, EntityRepositoryType, Index, PrimaryKey, Property } from '@mikro-orm/core'
import { PositionRepository } from './position.repository'
import { ObjectId } from '@mikro-orm/mongodb'

export interface Point {
  type: 'Point'
  /**
   * lat, lng
   */
  coordinates: [number, number]
}

interface PositionArgs {
  createdAt: Date
  trackerId: number
  coordinates: Point['coordinates']
}

@Entity({ customRepository: () => PositionRepository })
export class Position {
  constructor(args: PositionArgs) {
    this.point = {
      type: 'Point',
      coordinates: args.coordinates
    }
    this.createdAt = args.createdAt
    this.trackerId = args.trackerId
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

  /**
   * The date this position was generated by the tracker
   */
  @Property()
  createdAt!: Date

  /**
   * The date this position was recieved by the rastercar service
   */
  @Property()
  recievedAt: Date = new Date()

  /**
   * Relationship: N - 1
   *
   * A position belongs (was emmited by) a tracker, a tracker has many (emmits many) positions
   *
   * The ID of the tracker stored in in the postgres DB that sent this position
   */
  @Property()
  trackerId!: number
}
