import { MasterUserRepository } from '../repositories/master-user.repository'
import { RequestUser } from '../../auth/decorators/request-user.decorator'
import { UserOrMasterUser } from '../../auth/models/login-response.model'
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { MasterUserService } from '../services/master-user.service'
import { GqlAuthGuard } from '../../auth/guards/gql-jwt-auth.guard'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { UserRepository } from '../repositories/user.repository'
import { UserOnlyGuard } from '../guards/user-only-route.guard'
import { MasterUserModel } from '../models/master-user.model'
import { Selections } from '@jenyus-org/nestjs-graphql-utils'
import { MasterUser } from '../entities/master-user.entity'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'
import { UserModel } from '../models/user.model'
import { User } from '../entities/user.entity'
import { UseGuards } from '@nestjs/common'

const USER_MODEL_FIELDS = ['organization', 'accessLevel']
const MASTER_USER_MODEL_FIELDS = ['masterAccessLevel', 'accessLevel']

@Resolver(of(UserModel))
export class UserResolver {
  constructor(
    readonly userService: UserService,
    readonly userRepository: UserRepository,
    readonly masterUserService: MasterUserService,
    readonly masterUserRepository: MasterUserRepository
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
      ? this.userRepository.findOneOrFail({ id: user.id }, { populate: selectedUserFields as any })
      : this.masterUserRepository.findOneOrFail({ id: user.id }, { populate: masterUserOnlyFields as any })
  }

  @Query(returns(UserModel), { nullable: true })
  user(
    @Args({ name: 'id', type: is(Int) }) id: number,
    @Selections('user', USER_MODEL_FIELDS) populate: string[]
  ): Promise<UserModel | null> {
    return this.userRepository.findOne({ id }, { populate: populate as any })
  }

  @UseGuards(GqlAuthGuard, UserOnlyGuard)
  @Mutation(returns(UserModel))
  async updateMyProfile(
    @RequestUser() user: User,
    @Args('profileData') profileData: UpdateUserDTO,
    @Selections('user', USER_MODEL_FIELDS) populate: string[]
  ): Promise<UserModel> {
    await this.userService.updateUser(user, profileData)
    return this.userRepository.findOneOrFail({ id: user.id }, { populate: populate as any })
  }
}
