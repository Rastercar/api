import { OrganizationModel } from '../../organization/models/organization.model'
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { AccessLevelModel } from '../../auth/models/access-level.model'
import { PrismaService } from '../../../database/prisma.service'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { UserModel } from '../models/user.model'
import { master_user, user } from '@prisma/client'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '../../auth/guards/gql-jwt-auth.guard'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { isMasterUser } from '../user.utils'
import { UserOnlyGuard } from '../guards/user-only-route.guard'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(readonly prisma: PrismaService, readonly userService: UserService) {}

  @ResolveField('organization', () => OrganizationModel)
  organization(@Parent() { id }: user) {
    return this.prisma.user.findUnique({ where: { id } }).organization()
  }

  @ResolveField('accessLevel', () => AccessLevelModel)
  accessLevel(@Parent() { id }: user) {
    return this.prisma.user.findUnique({ where: { id } }).access_level()
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns(UserOrMasterUser))
  async me(@RequestUser() user: user | master_user) {
    return isMasterUser(user)
      ? this.prisma.master_user.findUnique({ where: { id: user.id } })
      : this.prisma.user.findUnique({ where: { id: user.id } })
  }

  @Query(returns(UserModel), { nullable: true })
  user(@Args({ name: 'id', type: is(Int) }) id: number): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(@RequestUser() user: user, @Args('profileData') profileData: UpdateUserDTO) {
    await this.userService.updateUser(user, profileData)
    return this.prisma.user.findUnique({ where: { id: user.id } })
  }
}
