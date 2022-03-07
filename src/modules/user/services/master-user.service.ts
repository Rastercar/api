import { PrismaService } from '../../../database/prisma.service'
import { master_user, Prisma } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class MasterUserService {
  constructor(readonly prisma: PrismaService) {}

  async updateMasterUser(user: master_user, newData: { emailVerified?: boolean; password?: string }): Promise<master_user> {
    const { emailVerified, password: newPassword } = newData

    const shouldUpdate = Object.values(newData).some(value => value !== undefined)
    if (!shouldUpdate) return user

    const data: Prisma.master_userUpdateInput = {
      email_verified: emailVerified
    }

    if (newPassword) data.password = bcrypt.hashSync(newPassword, 10)

    await this.prisma.master_user.update({ where: { id: user.id }, data })

    return user
  }
}
