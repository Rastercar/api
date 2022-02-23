import { MasterUserRepository } from '../repositories/master-user.repository'
import { Injectable } from '@nestjs/common'
import { MasterUser } from '../entities/master-user.entity'

@Injectable()
export class MasterUserService {
  constructor(readonly masterUserRepository: MasterUserRepository) {}

  async updateMasterUser(userToUpdate: MasterUser, newData: { emailVerified?: boolean }): Promise<MasterUser> {
    const { emailVerified } = newData

    if (typeof emailVerified === 'boolean') userToUpdate.emailVerified = emailVerified

    await this.masterUserRepository.persistAndFlush(userToUpdate)

    return userToUpdate
  }
}
