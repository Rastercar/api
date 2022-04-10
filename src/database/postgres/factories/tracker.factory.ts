import { trackerModel } from '../../../modules/tracker/tracker.constants'
import { Tracker } from '../../../modules/tracker/tracker.entity'
import { randomElementFromArray } from '../../../utils/rng.utils'
import { Factory } from '@mikro-orm/seeder'
import { v4 as uuid } from 'uuid'

export function createFakeTracker(): Partial<Tracker>
export function createFakeTracker(instantiate: true): Tracker
export function createFakeTracker(instantiate?: true): Tracker | Partial<Tracker> {
  const models: trackerModel[] = ['ST310U']

  const data = {
    identifier: `seeded_tracker__${uuid()}`,
    model: randomElementFromArray(models)
  }

  return instantiate ? new Tracker(data) : data
}

export class TrackerFactory extends Factory<Tracker> {
  model = Tracker as any

  definition() {
    return createFakeTracker()
  }
}
