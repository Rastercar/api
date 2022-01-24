import { is, of, returns } from '../../../utils/coverage-helpers'
import { Args, Int, Query, Resolver } from '@nestjs/graphql'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { UserModel } from '../models/user.model'
import { UserService } from '../user.service'
import { MikroORM } from '@mikro-orm/core'

@Resolver(of(UserModel))
export class UserResolver {
  constructor(readonly orm: MikroORM, private readonly userService: UserService) {}

  @Query(returns(UserModel), { nullable: true })
  @UseRequestContext()
  user(@Args({ name: 'id', type: is(Int) }) id: number): Promise<UserModel> {
    return this.userService.userRepository.findOneOrFail({ id })
  }
}
