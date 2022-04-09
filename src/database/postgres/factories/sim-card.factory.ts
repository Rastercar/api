import { apnsByBrazillianProvider } from '../../../constants/sim-card-apn'
import { SimCard } from '../../../modules/sim-card/sim-card.entity'
import { randomElementFromArray } from '../../../utils/rng.utils'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeSimCard(): Partial<SimCard>
export function createFakeSimCard(instantiate: true): SimCard
export function createFakeSimCard(instantiate?: true): SimCard | Partial<SimCard> {
  const apnProviders = Object.values(apnsByBrazillianProvider)
  const { apnAddress, apnPassword, apnUser } = randomElementFromArray(apnProviders)

  const data = {
    ssn: faker.helpers.replaceSymbolWithNumber('89#########'),
    apnUser,
    apnAddress,
    apnPassword,
    // Phone number must be a valid E164 number, see: https://en.wikipedia.org/wiki/E.164
    // +55 -> brazil
    // ########### -> 9 random digits. Although fixed line numbers have 8 digits all mobile
    // numbers have 9 digits, its safe to assume all sim card numbers are mobile numbers.
    phoneNumber: faker.phone.phoneNumber('+55###########')
  }

  return instantiate ? new SimCard(data) : data
}

export class SimCardFactory extends Factory<SimCard> {
  model = SimCard as any

  definition() {
    return createFakeSimCard()
  }
}
