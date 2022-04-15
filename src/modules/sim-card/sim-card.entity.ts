import { Entity, EntityRepositoryType, ManyToOne, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { Organization } from '../organization/entities/organization.entity'
import { Tracker } from '../tracker/tracker.entity'
import { SimCardRepository } from './sim-card.repository'

interface SimCardArgs {
  ssn: string
  apnUser: string
  apnAddress: string
  apnPassword: string
  phoneNumber: string
}

@Entity({ customRepository: () => SimCardRepository })
export class SimCard extends BaseEntity {
  /**
   * @see https://en.wikipedia.org/wiki/SIM_card
   */
  constructor(data: SimCardArgs) {
    super()

    this.ssn = data.ssn
    this.apnUser = data.apnUser
    this.apnAddress = data.apnAddress
    this.apnPassword = data.apnPassword
    this.phoneNumber = data.phoneNumber
  }

  [EntityRepositoryType]?: SimCardRepository

  /**
   * The phone number in the E164 format
   */
  @Property({ comment: 'Phone numbers are stored in the E164 international format' })
  @Unique()
  phoneNumber!: string

  /**
   * A unique identifier emmited for every sim card, commonly reffered to as
   * ICC-ID, serial number or SSN. **note:** do not mistake for IMEI
   *
   * @see https://www.hologram.io/blog/whats-an-iccid-number-and-why-does-it-matter-for-cellular-iot
   */
  @Property()
  @Unique()
  ssn!: string

  @Property()
  apnAddress!: string

  @Property()
  apnUser!: string

  @Property()
  apnPassword!: string

  /**
   * Relationship: N - 1
   *
   * The organization that owns this sim card
   */
  @ManyToOne(() => Organization)
  organization!: Organization

  /**
   * Relationship: N - 0...1
   *
   * The tracker the simCard is suposedly installed on
   */
  @ManyToOne(() => Tracker, { nullable: true })
  tracker!: Tracker | null
}
