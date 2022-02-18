import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { MasterUserService } from '../services/master-user.service'
import { GqlAuthGuard } from '../../auth/guards/gql-jwt-auth.guard'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { UserOnlyGuard } from '../guards/user-only-route.guard'
import { MasterUserModel } from '../models/master-user.model'
import { Selections } from '@jenyus-org/nestjs-graphql-utils'
import { MasterUser } from '../entities/master-user.entity'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { UserModel } from '../models/user.model'
import { User } from '../entities/user.entity'
import { MikroORM } from '@mikro-orm/core'
import { UseGuards } from '@nestjs/common'

const USER_MODEL_FIELDS = ['organization', 'accessLevel']
const MASTER_USER_MODEL_FIELDS = ['masterAccessLevel', 'accessLevel']

@Resolver(of(UserModel))
export class UserResolver {
  constructor(
    readonly orm: MikroORM,
    private readonly userService: UserService,
    private readonly masterUserService: MasterUserService,
    readonly organizationRepository: OrganizationRepository
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(returns(UserOrMasterUser))
  async me(
    @RequestUser() user: User | MasterUser,
    @Selections('me', ['organization', 'accessLevel', 'masterAccessLevel']) populate: string[]
  ): Promise<UserModel | MasterUserModel> {
    if (populate.length === 0) return user

    const selectedUserFields = populate.filter(field => USER_MODEL_FIELDS.includes(field))
    const masterUserOnlyFields = populate.filter(field => MASTER_USER_MODEL_FIELDS.includes(field))

    return user instanceof User
      ? this.userService.userRepository.findOneOrFail({ id: user.id }, { populate: selectedUserFields as any })
      : this.masterUserService.masterUserRepository.findOneOrFail({ id: user.id }, { populate: masterUserOnlyFields as any })
  }

  @Query(returns(UserModel), { nullable: true })
  @UseRequestContext()
  user(
    @Args({ name: 'id', type: is(Int) }) id: number,
    @Selections('user', USER_MODEL_FIELDS) populate: string[]
  ): Promise<UserModel | null> {
    return this.userService.userRepository.findOne({ id }, { populate: populate as any })
  }

  @UseRequestContext()
  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(
    @RequestUser() user: User,
    @Args('profileData') profileData: UpdateUserDTO,
    @Selections('user', USER_MODEL_FIELDS) populate: string[]
  ): Promise<UserModel> {
    await this.userService.updateUser(user, profileData)

    return this.userService.userRepository.findOneOrFail({ id: user.id }, { populate: populate as any })
  }
}
