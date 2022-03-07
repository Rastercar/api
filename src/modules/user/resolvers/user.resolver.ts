import { UseGuards } from '@nestjs/common'
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { MasterUser, User } from '@prisma/client'

import { PrismaService } from '../../../database/prisma.service'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { GqlAuthGuard } from '../../auth/guards/gql-jwt-auth.guard'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import { OrganizationModel } from '../../organization/models/organization.model'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserOnlyGuard } from '../guards/user-only-route.guard'
import { UserModel } from '../models/user.model'
import { UserService } from '../services/user.service'
import { isMasterUser } from '../user.utils'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(readonly prisma: PrismaService, readonly userService: UserService) {}

  @ResolveField('organization', () => OrganizationModel)
  organization(@Parent() { id }: User) {
    return this.prisma.user.findUnique({ where: { id } }).organization()
  }

  @ResolveField('accessLevel', () => AccessLevelModel)
  accessLevel(@Parent() { id }: User) {
    return this.prisma.user.findUnique({ where: { id } }).accessLevel()
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns(UserOrMasterUser))
  async me(@RequestUser() user: User | MasterUser) {
    return isMasterUser(user)
      ? this.prisma.masterUser.findUnique({ where: { id: user.id } })
      : this.prisma.user.findUnique({ where: { id: user.id } })
  }

  @Query(returns(UserModel), { nullable: true })
  user(@Args({ name: 'id', type: is(Int) }) id: number): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(@RequestUser() user: User, @Args('profileData') profileData: UpdateUserDTO) {
    await this.userService.updateUser(user, profileData)
    return this.prisma.user.findUnique({ where: { id: user.id } })
  }
}
