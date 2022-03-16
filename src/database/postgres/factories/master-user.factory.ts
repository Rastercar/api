import { MasterUser } from '../../../modules/user/entities/master-user.entity'
import { createFakeMasterAccessLevel } from './master-access-level.factory'
import { createFakeAccessLevel } from './access-level.factory'
import { Factory, faker } from '@mikro-orm/seeder'
import * as bcrypt from 'bcrypt'

export function createFakeMasterUser(): Partial<MasterUser>
export function createFakeMasterUser(instantiate: true): MasterUser
export function createFakeMasterUser(instantiate?: true): MasterUser | Partial<MasterUser> {
  const data = {
    username: faker.internet.userName(),
    password: bcrypt.hashSync(faker.internet.password(), 1),

    email: faker.internet.email(),
    emailVerified: Math.random() < 0.5,

    resetPasswordToken: null,

    accessLevel: createFakeAccessLevel(true),
    masterAccessLevel: createFakeMasterAccessLevel(true)
  }

  return instantiate ? new MasterUser(data) : data
}

export class MasterUserFactory extends Factory<MasterUser> {
  model = MasterUser as any

  definition(): Partial<MasterUser> {
    return createFakeMasterUser()
  }
}
