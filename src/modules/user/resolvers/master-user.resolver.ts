import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { MasterUser } from '@prisma/client'

import { PrismaService } from '../../../database/prisma.service'
import { of } from '../../../utils/coverage-helpers'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { MasterAccessLevelModel } from '../../auth/models/master-access-level.model'
import { MasterUserModel } from '../models/master-user.model'

@Resolver(of(MasterUserModel))
export class MasterUserResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('accessLevel', () => AccessLevelModel)
  async accessLevel(@Parent() masterUser: MasterUser) {
    return this.prisma.masterUser
      .findUnique({
        where: { id: masterUser.id }
      })
      .accessLevel()
  }

  @ResolveField('masterAccessLevel', () => MasterAccessLevelModel)
  async masterAccessLevel(@Parent() masterUser: MasterUser) {
    return this.prisma.masterUser
      .findUnique({
        where: { id: masterUser.id }
      })
      .masterAccessLevel()
  }
}
