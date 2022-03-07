import { UnregisteredUserModel } from '../models/unregistered-user.model'
import { is, of, returns } from '../../../utils/coverage-helpers'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { PrismaService } from '../../../database/prisma.service'
import { NotFoundException } from '@nestjs/common'

@Resolver(of(UnregisteredUserModel))
export class UnregisteredUserResolver {
  constructor(readonly prisma: PrismaService) {}

  @Query(returns(UnregisteredUserModel), { nullable: true })
  async unregisteredUser(@Args({ name: 'uuid', type: is(String) }) uuid: string): Promise<UnregisteredUserModel> {
    const ur = await this.prisma.unregistered_user.findUnique({ where: { uuid }, rejectOnNotFound: true })
    if (!ur) throw new NotFoundException()
    return ur
  }
}
