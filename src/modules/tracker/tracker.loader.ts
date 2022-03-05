import { createDataLoader } from '../../graphql/data-loader.utils'
import { TrackerRepository } from './tracker.repository'
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export default class TrackerLoader {
  constructor(readonly trackerRepository: TrackerRepository) {}

  loader = createDataLoader(this.trackerRepository)
}
