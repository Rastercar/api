import { Entity, EntityRepositoryType, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base/base-entity'
import { SimCardRepository } from './sim-card.repository'

interface SimCardArgs {
  phoneNumber: string
  ssn: string
  apnAddress: string
  apnUser: string
  apnPassword: string
}

@Entity({ customRepository: () => SimCardRepository })
export class SimCard extends BaseEntity {
  /**
   * @see https://en.wikipedia.org/wiki/SIM_card
   */
  constructor(data: SimCardArgs) {
    super()

    this.phoneNumber = data.phoneNumber
    this.ssn = data.ssn

    this.apnPassword = data.apnPassword
    this.apnAddress = data.apnAddress
    this.apnUser = data.apnUser
  }

  [EntityRepositoryType]?: SimCardRepository

  @Property()
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
}
