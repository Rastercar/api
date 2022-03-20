import { EntityRepository } from '@mikro-orm/mongodb'
import { Position } from './position.entity'

export class PositionRepository extends EntityRepository<Position> {}
