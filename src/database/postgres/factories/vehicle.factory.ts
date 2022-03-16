import { randomColor, randomIntFromInterval } from '../../../utils/rng.utils'
import { Vehicle } from '../../../modules/vehicle/vehicle.entity'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeVehicle(): Partial<Vehicle>
export function createFakeVehicle(instantiate: true): Vehicle
export function createFakeVehicle(instantiate?: true): Vehicle | Partial<Vehicle> {
  const modelYear = randomIntFromInterval(1990, new Date().getFullYear())
  const fabricationYearDiff = randomIntFromInterval(-2, 2)

  const data = {
    plate: faker.vehicle.vrm(),
    modelYear,
    fabricationYear: modelYear + fabricationYearDiff,
    chassisNumber: faker.vehicle.vin(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    renavam: faker.vehicle.vin(),
    color: randomColor()
  }

  return instantiate ? new Vehicle(data) : data
}

export class VehicleFactory extends Factory<Vehicle> {
  model = Vehicle as any

  definition() {
    return createFakeVehicle()
  }
}
