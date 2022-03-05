import { Tracker, trackerModel } from '../../modules/tracker/tracker.entity'
import { randomElementFromArray } from '../../utils/rng.utils'
import { Factory } from '@mikro-orm/seeder'

export function createFakeTracker(): Partial<Tracker>
export function createFakeTracker(instantiate: true): Tracker
export function createFakeTracker(instantiate?: true): Tracker | Partial<Tracker> {
  const models: trackerModel[] = ['maxtrack', 'suntech', 'gtk']

  const data = {
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
