import { EntityRepository } from '@mikro-orm/postgresql'
import { Vehicle } from './vehicle.entity'

export class VehicleRepository extends EntityRepository<Vehicle> {}
