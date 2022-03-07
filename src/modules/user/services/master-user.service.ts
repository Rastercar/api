import { Injectable } from '@nestjs/common'
import { MasterUser, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { PrismaService } from '../../../database/prisma.service'

@Injectable()
export class MasterUserService {
  constructor(readonly prisma: PrismaService) {}

  async updateMasterUser(user: MasterUser, newData: { emailVerified?: boolean; password?: string }): Promise<MasterUser> {
    const { emailVerified, password: newPassword } = newData

    const shouldUpdate = Object.values(newData).some(value => value !== undefined)
    if (!shouldUpdate) return user

    const data: Prisma.MasterUserUpdateInput = { emailVerified }

    if (newPassword) data.password = bcrypt.hashSync(newPassword, 10)

    await this.prisma.masterUser.update({ where: { id: user.id }, data })

    return user
  }
}
