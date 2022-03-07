import { Prisma, PrismaClient } from '@prisma/client'

import { randomBool } from '../src/utils/rng.utils'
import { accessLevelFactory } from './factories/access-level.factory'
import { organizationFactory } from './factories/organization.factory'
import { simCardFactory } from './factories/sim-card.factory'
import { trackerFactory } from './factories/tracker.factory'
import { userFactory } from './factories/user.factory'
import { vehicleFactory } from './factories/vehicle.factory'

const prisma = new PrismaClient()

function create<T>(n: number, factory: () => T): T[] {
  return [...Array(n).keys()].map(factory)
}

const getIds = (rows: { id: number }[]) => rows.map(row => row.id)

export const seedOrganization = async () => {
  const org = await prisma.organization.create({
    data: organizationFactory()
  })

  const accessLevel = await prisma.accessLevel.create({
    data: accessLevelFactory()
  })

  await prisma.user.createMany({
    data: create(10, () => ({ ...userFactory(), organizationId: org.id, accessLevelId: accessLevel.id }))
  })

  await prisma.vehicle.createMany({
    data: create(10, () => ({ ...vehicleFactory(), organizationId: org.id }))
  })

  const vehicleIds = await prisma.vehicle
    .findMany({
      select: { id: true }
    })
    .then(getIds)

  const createTrackersPayload = vehicleIds
    .map(vehicleId => (randomBool(20) ? null : trackerFactory({ vehicleId, organizationId: org.id })))
    .filter(payload => payload !== null)

  await prisma.tracker.createMany({
    data: createTrackersPayload as Prisma.TrackerCreateManyInput[]
  })

  const trackerIds = await prisma.tracker
    .findMany({
      select: { id: true }
    })
    .then(getIds)

  const createSimCardPayload = trackerIds
    .map(trackerId => (randomBool(20) ? null : simCardFactory({ trackerId, organizationId: org.id })))
    .filter(payload => payload !== null)

  await prisma.simCard.createMany({
    data: createSimCardPayload as Prisma.SimCardCreateManyInput[]
  })
}
