import { Entity, EntityRepositoryType, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base/base-entity'
import { TrackerRepository } from './tracker.repository'

type trackerModel = 'maxtrack'

interface TrackerArgs {
  model: trackerModel
}

/**
 * Tracker models supported by the plataform
 */

@Entity({ customRepository: () => TrackerRepository })
export class Tracker extends BaseEntity {
  constructor(data: TrackerArgs) {
    super()
    this.model = data.model
  }

  [EntityRepositoryType]?: TrackerRepository

  @Property({ type: String })
  model!: trackerModel
}
