import { MasterAccessLevelModel } from '../../auth/models/master-access-level.model'
import { MasterUserRepository } from '../repositories/master-user.repository'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { MasterUserModel } from '../models/master-user.model'
import { MasterUser } from '../entities/master-user.entity'
import { of } from '../../../utils/coverage-helpers'

@Resolver(of(MasterUserModel))
export class MasterUserResolver {
  constructor(readonly masterUserRepository: MasterUserRepository) {}

  @ResolveField('accessLevel', () => AccessLevelModel)
  async accessLevel(@Parent() user: MasterUser) {
    await this.masterUserRepository.populate(user, ['accessLevel'])
    return user.accessLevel
  }

  @ResolveField('masterAccessLevel', () => MasterAccessLevelModel)
  async masterAccessLevel(@Parent() user: MasterUser) {
    await this.masterUserRepository.populate(user, ['masterAccessLevel'])
    return user.masterAccessLevel
  }
}
