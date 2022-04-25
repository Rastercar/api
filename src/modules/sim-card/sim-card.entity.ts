import { Entity, EntityRepositoryType, ManyToOne, Property, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/postgres/base/base-entity'
import { Organization } from '../organization/entities/organization.entity'
import { Tracker } from '../tracker/tracker.entity'
import { SimCardRepository } from './sim-card.repository'

interface SimCardArgs {
  ssn: string
  phoneNumber: string

  apnUser: string
  apnAddress: string
  apnPassword: string

  pin?: string
  pin2?: string

  puk?: string
  puk2?: string

  organization?: Organization
}

interface FullSimCardArgs extends SimCardArgs {
  organization: Organization
}

@Entity({ customRepository: () => SimCardRepository })
export class SimCard extends BaseEntity {
  /**
   * @see https://en.wikipedia.org/wiki/SIM_card
   */
  constructor(data: SimCardArgs) {
    super()

    this.ssn = data.ssn
    this.phoneNumber = data.phoneNumber

    this.pin = data.pin ?? null
    this.pin2 = data.pin2 ?? null

    this.puk = data.puk ?? null
    this.puk2 = data.puk2 ?? null

    this.apnUser = data.apnUser
    this.apnAddress = data.apnAddress
    this.apnPassword = data.apnPassword

    if (data.organization) this.organization = data.organization
  }

  /**
   * Creates a sim card, requiring all columns that are necessary to persist in the database
   */
  static create(args: FullSimCardArgs): SimCard {
    return new SimCard(args)
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
   * Personal identification number, nullable as its not needed for the plataform.
   * The PIN1 code is used to prevent others from gaining unauthorized access to your mobile phone handset
   *
   * @see: www.docomo.ne.jp/english/support/trouble/password/pin/
   */
  @Property({ type: String, length: 8, nullable: true })
  pin!: string | null

  /**
   * The PIN2 code is a four- to eight-digit password that you enter when using or
   * requesting user certificates or performing tasks such as resetting total call charges.
   *
   * @see: www.docomo.ne.jp/english/support/trouble/password/pin/
   */
  @Property({ type: String, length: 8, nullable: true })
  pin2!: string | null

  /**
   * PUK1 and PUK2 are used to unblock PIN1 and PIN2 respectively. As PIN1 is the primary
   * means of access to a handset, blocking PIN1 will block the entire handset until PUK1 is entered.
   *
   * @see: justaskthales.com/en/difference-puk1-puk2-codes/
   */
  @Property({ type: String, length: 8, nullable: true })
  puk!: string | null

  /**
   * PUK1 and PUK2 are used to unblock PIN1 and PIN2 respectively. As PIN1 is the primary
   * means of access to a handset, blocking PIN1 will block the entire handset until PUK1 is entered.
   *
   * @see: justaskthales.com/en/difference-puk1-puk2-codes/
   */
  @Property({ type: String, length: 8, nullable: true })
  puk2!: string | null

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
