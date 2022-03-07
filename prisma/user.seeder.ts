import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export const userSeeder = async () => {
  await prisma.user.createMany({
    data: [{}]
  })
}

const defaultTestUserOrg = new Organization({
  name: 'testuser org',
  billingEmail: 'testuser@gmail.com',
  billingEmailVerified: true
})

/**
 * A static user for testing, this user is, created everytime the user seeders are run.
 */
export const defaultTestUser: Partial<User> = {
  username: 'testuser',
  password: bcrypt.hashSync('testuser', 10),

  email: 'testuser@gmail.com',
  emailVerified: true,

  googleProfileId: null,

  organization: defaultTestUserOrg,

  accessLevel: new AccessLevel({
    isFixed: true,
    name: 'testUserAccessLevel',
    description: 'wew lad !',
    organization: defaultTestUserOrg,
    permissions: []
  })
}

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const factory = new UserFactory(em)
    const users = await factory.create(5)
    const defTestUser = await factory.createOne(defaultTestUser)

    users.push(defTestUser)

    // Since orgs cannot have owners when they are being created, since the user would
    // also need a org (the one we are creating) the solution is to update every created
    // user org to have the created user as the owner
    users.map(user => {
      user.organization.owner = user
    })

    await em.flush()
  }
}
