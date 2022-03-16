import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core'
import { Organization } from '../organization/entities/organization.entity'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { VehicleRepository } from './vehicle.repository'
import { Tracker } from '../tracker/tracker.entity'

interface VehicleArgs {
  plate: string
  brand?: string
  model?: string
  color?: string
  renavam?: string
  modelYear?: number
  chassisNumber?: string
  fabricationYear?: number
}

@Unique({ properties: ['plate', 'organization'] })
@Entity({ customRepository: () => VehicleRepository })
export class Vehicle extends BaseEntity {
  constructor(data: VehicleArgs) {
    super()

    this.plate = data.plate
    this.brand = data.brand ?? null
    this.model = data.model ?? null
    this.color = data.color ?? null
    this.renavam = data.renavam ?? null
    this.modelYear = data.modelYear ?? null
    this.chassisNumber = data.chassisNumber ?? null
    this.fabricationYear = data.fabricationYear ?? null
  }

  [EntityRepositoryType]?: VehicleRepository

  @Property()
  plate!: string

  /**
   * S3 object ID
   */
  @Property({ type: String, nullable: true })
  photo!: string | null

  @Property({ type: Number, nullable: true, columnType: 'smallint' })
  modelYear!: number | null

  @Property({ type: Number, nullable: true, columnType: 'smallint' })
  fabricationYear!: number | null

  /**
   * @see https://centercarjf.com.br/blog/detalhe/10506/numero-do-chassi-o-que-significa-e-onde-consultar/#
   */
  @Property({ type: String, nullable: true })
  chassisNumber!: string | null

  /**
   * Example: honda, volkswagen, toyota
   */
  @Property({ type: String, nullable: true })
  brand!: string | null

  /**
   * Example: civic, torino, hilux
   */
  @Property({ type: String, nullable: true })
  model!: string | null

  /**
   * @see https://www.consultaauto.com.br/blog/documentacao/o-que-e-renavam
   */
  @Property({ type: String, nullable: true })
  renavam!: string | null

  /**
   * Human readable representation of a color like "red" or "blue", not a rbg or hex
   */
  @Property({ type: String, nullable: true })
  color!: string | null

  /**
   * Relationship: N - 1
   *
   * The organization that owns this vehicle
   */
  @ManyToOne(() => Organization)
  organization!: Organization

  /**
   * Relationship 1 - 0...N
   *
   * Trackers that are suposedlly installed on the vehicle.
   *
   * **NOTE:** 99% of the times a vehicle will have a single tracker installed,
   * but there might be cases where multiple trackers are installed as a fallback
   */
  @OneToMany({ entity: () => Tracker, mappedBy: tracker => tracker.vehicle })
  trackers = new Collection<Tracker>(this)
}
