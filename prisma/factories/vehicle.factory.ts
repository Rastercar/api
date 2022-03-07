import { Prisma } from '@prisma/client'
import * as faker from 'faker'

import { randomColor, randomIntFromInterval } from '../../src/utils/rng.utils'

export const vehicleFactory = (overides?: Partial<Prisma.VehicleCreateManyInput>): Prisma.VehicleCreateManyInput => {
  const modelYear = randomIntFromInterval(1990, new Date().getFullYear())
  const fabricationYearDiff = randomIntFromInterval(-2, 2)

  return {
    plate: faker.vehicle.vrm(),
    modelYear,
    fabricationYear: modelYear + fabricationYearDiff,
    chassisNumber: faker.vehicle.vin(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    renavam: faker.vehicle.vin(),
    color: randomColor(),
    organizationId: 1,

    ...overides
  }
}
