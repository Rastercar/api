import { MasterAccessLevel } from '../../../modules/auth/entities/master-access-level.entity'
import { MASTER_PERMISSION } from '../../../modules/auth/constants/permissions'
import { enumToRandomImpartialArray } from '../../../utils/enum.utils'
import { Factory, faker } from '@mikro-orm/seeder'

export function createFakeMasterAccessLevel(): Partial<MasterAccessLevel>
export function createFakeMasterAccessLevel(instantiate: true): MasterAccessLevel
export function createFakeMasterAccessLevel(instantiate?: true): MasterAccessLevel | Partial<MasterAccessLevel> {
  const data = {
    name: `master access level ${faker.lorem.words(1)}`,
    description: faker.lorem.words(7),
    permissions: enumToRandomImpartialArray(MASTER_PERMISSION)
  }
  return instantiate ? new MasterAccessLevel(data) : data
}

export class MasterAccessLevelFactory extends Factory<MasterAccessLevel> {
  model = MasterAccessLevel as any

  definition(): Partial<MasterAccessLevel> {
    return createFakeMasterAccessLevel()
  }
}
