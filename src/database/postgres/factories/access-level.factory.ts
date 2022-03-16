import { AccessLevel } from '../../../modules/auth/entities/access-level.entity'
import { PERMISSION } from '../../../modules/auth/constants/permissions'
import { enumToRandomImpartialArray } from '../../../utils/enum.utils'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeAccessLevel(): Partial<AccessLevel>
export function createFakeAccessLevel(instantiate: true): AccessLevel
export function createFakeAccessLevel(instantiate?: true): AccessLevel | Partial<AccessLevel> {
  const data = {
    name: `access level ${faker.lorem.words(1)}`,
    description: faker.lorem.words(7),
    permissions: enumToRandomImpartialArray(PERMISSION)
  }

  return instantiate ? new AccessLevel(data) : data
}

export class AccessLevelFactory extends Factory<AccessLevel> {
  model = AccessLevel as any

  definition(): Partial<AccessLevel> {
    return createFakeAccessLevel()
  }
}
