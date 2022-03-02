import { EntityRepository } from '@mikro-orm/postgresql'
import { Tracker } from './tracker.entity'

export class TrackerRepository extends EntityRepository<Tracker> {}
