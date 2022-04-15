import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { Organization } from '../organization/entities/organization.entity'
import { Tracker } from '../tracker/tracker.entity'
import { VehicleRepository } from './vehicle.repository'

interface VehicleArgs {
  plate: string
  brand?: string | null
  model?: string | null
  color?: string | null
  fuelType?: string | null
  fuelConsumption?: number | null
  renavam?: string | null
  modelYear?: number | null
  chassisNumber?: string | null
  fabricationYear?: number | null
  additionalInfo?: string | null
}

@Entity({ customRepository: () => VehicleRepository })
export class Vehicle extends BaseEntity {
  constructor(data: VehicleArgs) {
    super()

    this.plate = data.plate
    this.brand = data.brand ?? null
    this.model = data.model ?? null
    this.color = data.color ?? null
    this.renavam = data.renavam ?? null
    this.fuelType = data.fuelType ?? null
    this.additionalInfo = data.additionalInfo ?? null
    this.modelYear = data.modelYear ?? null
    this.chassisNumber = data.chassisNumber ?? null
    this.fuelConsumption = data.fuelConsumption ?? null
    this.fabricationYear = data.fabricationYear ?? null
  }

  [EntityRepositoryType]?: VehicleRepository

  @Property()
  @Unique()
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
   * Fuel type, for example: "gasoline", "additive gasoline", "ethanol"
   */
  @Property({ type: String, nullable: true })
  fuelType!: string | null

  /**
   * Fuel consumption in km/l
   */
  @Property({ type: Number, nullable: true })
  fuelConsumption!: number | null

  /**
   * Free varchar field for any additional information/observations
   */
  @Property({ type: String, nullable: true })
  additionalInfo!: string | null

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
