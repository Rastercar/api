import { MasterAccessLevelModel } from '../../auth/models/master-access-level.model'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { PrismaService } from '../../../database/prisma.service'
import { Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { MasterUserModel } from '../models/master-user.model'
import { of } from '../../../utils/coverage-helpers'
import { master_user } from '@prisma/client'

@Resolver(of(MasterUserModel))
export class MasterUserResolver {
  constructor(readonly prisma: PrismaService) {}

  @ResolveField('accessLevel', () => AccessLevelModel)
  async accessLevel(@Parent() master_user: master_user) {
    return this.prisma.master_user
      .findUnique({
        where: { id: master_user.id }
      })
      .access_level()
  }

  @ResolveField('masterAccessLevel', () => MasterAccessLevelModel)
  async masterAccessLevel(@Parent() master_user: master_user) {
    return this.prisma.master_user
      .findUnique({
        where: { id: master_user.id }
      })
      .master_access_level()
  }
}
