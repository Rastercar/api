import { PrismaClient } from '@prisma/client'

import { unregisteredUserFactory } from './factories/unregistered-user.factory'
import { seedOrganization } from './organization.seeder'

const prisma = new PrismaClient()

const array = (n: number) => [...Array(n).keys()]

async function main() {
  console.log(`Seeding started...`)

  await Promise.all(array(10).map(() => seedOrganization()))

  await prisma.unregisteredUser.createMany({ data: array(20).map(() => unregisteredUserFactory()) })

  console.log(`Seeding finished.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
