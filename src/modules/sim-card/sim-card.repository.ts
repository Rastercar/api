import { EntityRepository } from '@mikro-orm/postgresql'
import { SimCard } from './sim-card.entity'

export class SimCardRepository extends EntityRepository<SimCard> {}
