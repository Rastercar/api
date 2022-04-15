import { Factory, faker } from '@mikro-orm/seeder'
import { Vehicle } from '../../../modules/vehicle/vehicle.entity'
import { randomColor, randomElementFromArray, randomIntFromInterval } from '../../../utils/rng.utils'

const fuels = ['gasoline', 'ethanol', 'additive gasoline', null]

export function createFakeVehicle(): Partial<Vehicle>
export function createFakeVehicle(instantiate: true): Vehicle
export function createFakeVehicle(instantiate?: true): Vehicle | Partial<Vehicle> {
  const modelYear = randomIntFromInterval(1990, new Date().getFullYear())
  const fabricationYearDiff = randomIntFromInterval(-2, 2)

  const fuelType = randomElementFromArray(fuels)

  const data = {
    plate: faker.helpers.replaceSymbols('???####'),
    modelYear,
    fabricationYear: modelYear + fabricationYearDiff,
    chassisNumber: faker.vehicle.vin(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    renavam: faker.vehicle.vin(),
    color: randomColor(),
    fuelType,
    fuelConsumption: fuelType ? randomIntFromInterval(7, 15) : null,
    additionalInfo: 'created by vehicle seeder'
  }

  return instantiate ? new Vehicle(data) : data
}

export class VehicleFactory extends Factory<Vehicle> {
  model = Vehicle as any

  definition() {
    return createFakeVehicle()
  }
}
