import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { UserService } from './user.service'
import { UserModel } from './models/user.model'

@Resolver(of => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => UserModel)
  async user(@Args({ name: 'id', type: () => Int }) id: number): Promise<UserModel> {
    return this.userService.userRepository.findOneOrFail({ id })
  }
}
