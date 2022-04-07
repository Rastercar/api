import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import { Organization } from '../organization/entities/organization.entity'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { TrackerRepository } from './tracker.repository'
import { SimCard } from '../sim-card/sim-card.entity'
import { Vehicle } from '../vehicle/vehicle.entity'
import { trackerModel } from './tracker.constants'

interface TrackerArgs {
  model: trackerModel
}

@Entity({ customRepository: () => TrackerRepository })
export class Tracker extends BaseEntity {
  constructor(data: TrackerArgs) {
    super()
    this.model = data.model
  }

  [EntityRepositoryType]?: TrackerRepository

  @Property({ type: String })
  model!: trackerModel

  /**
   * A human readable identifier, ex: MXT013-BOX-33, Tracker 123 lote 2
   */
  @Property({ type: String, nullable: true })
  identifier!: string | null

  /**
   * Relationship: N - 1
   *
   * The organization that owns this tracker
   */
  @ManyToOne(() => Organization)
  organization!: Organization

  /**
   * Relationship: N - 0...1
   *
   * The vehicle the tracker is suposedly installed on
   */
  @ManyToOne(() => Vehicle, { nullable: true })
  vehicle!: Vehicle | null

  /**
   * Relationship 1 - 0...N
   *
   * Sim cards installed in the tracker
   *
   * **NOTE:** Most tracker models only support a single sim card but more
   * modern models have dualship support, so the relationship is 1 - N
   */
  @OneToMany({ entity: () => SimCard, mappedBy: simCard => simCard.tracker })
  simCards = new Collection<SimCard>(this)
}
