import { apnsByBrazillianProvider } from '../../../constants/sim-card-apn'
import { SimCard } from '../../../modules/sim-card/sim-card.entity'
import { Factory, faker } from '@mikro-orm/seeder'
import { randomElementFromArray } from '../../../utils/rng.utils'

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
    phoneNumber: faker.phone.phoneNumber('+55 (##) #####-#####')
  }

  return instantiate ? new SimCard(data) : data
}

export class SimCardFactory extends Factory<SimCard> {
  model = SimCard as any

  definition() {
    return createFakeSimCard()
  }
}
