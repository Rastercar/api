import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { Organization } from '../organization/entities/organization.entity'
import { SimCard } from '../sim-card/sim-card.entity'
import { Vehicle } from '../vehicle/vehicle.entity'
import { trackerModel } from './tracker.constants'
import { TrackerRepository } from './tracker.repository'

interface TrackerArgs {
  model: trackerModel
  identifier: string
  inMaintenance?: boolean

  vehicle?: Vehicle
  organization?: Organization
}

interface FullTrackerArgs extends TrackerArgs {
  organization: Organization
}

@Entity({ customRepository: () => TrackerRepository })
export class Tracker extends BaseEntity {
  constructor(data: TrackerArgs) {
    super()
    this.model = data.model
    this.identifier = data.identifier
    this.inMaintenance = data.inMaintenance ?? false

    this.vehicle = data.vehicle ?? null
    if (data.organization) this.organization = data.organization
  }

  /**
   * Creates a tracker, requiring all columns that are necessary to persist in the database
   */
  static create(args: FullTrackerArgs): Tracker {
    return new Tracker(args)
  }

  [EntityRepositoryType]?: TrackerRepository

  @Property({ type: String })
  model!: trackerModel

  /**
   * A identifier for the tracker, normally the serial number
   */
  @Property({ type: String })
  @Unique()
  identifier!: string

  /**
   * If the tracker is in maintenance mode and should not trigger
   * any events, like communication failure events
   */
  @Property({ type: Boolean, default: false })
  inMaintenance!: boolean

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
