import { is, of, returns } from '../../../utils/coverage-helpers'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { UserModel } from '../models/user.model'
import { UserService } from '../user.service'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns(UserModel), { nullable: true })
  user(@Args({ name: 'id', type: is(Int) }) id: number): Promise<UserModel> {
    return this.userService.userRepository.findOneOrFail({ id })
  }
}
