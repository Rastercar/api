import { MasterUserRepository } from '../repositories/master-user.repository'
import { MasterUser } from '../entities/master-user.entity'
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class MasterUserService {
  constructor(readonly masterUserRepository: MasterUserRepository) {}

  async updateMasterUser(userToUpdate: MasterUser, newData: { emailVerified?: boolean; password?: string }): Promise<MasterUser> {
    const { emailVerified, password: newPassword } = newData

    if (typeof emailVerified === 'boolean') userToUpdate.emailVerified = emailVerified
    if (newPassword) userToUpdate.password = bcrypt.hashSync(newPassword, 10)

    await this.masterUserRepository.persistAndFlush(userToUpdate)

    return userToUpdate
  }
}
