import { UnregisteredUserRepository } from './repositories/unregistered-user.repository'
import { UserRepository } from './repositories/user.repository'
import { Profile } from 'passport-google-oauth20'
import { Injectable } from '@nestjs/common'
import { UnregisteredUser } from './entities/unregistered-user.entity'

@Injectable()
export class UserService {
  constructor(readonly userRepository: UserRepository, readonly unregisteredUserRepository: UnregisteredUserRepository) {}

  async createOrFindUnregisteredUserForGoogleProfile(googleProfile: Profile): Promise<UnregisteredUser> {
    const existingUrUser = await this.unregisteredUserRepository.findOne({ oauthProfileId: googleProfile.id, oauthProvider: 'google' })

    if (existingUrUser) return existingUrUser

    const profileEmail = googleProfile.emails?.[0] ?? { value: undefined, verified: 'false' }

    const unregisteredUser = new UnregisteredUser({
      username: googleProfile.username,

      email: profileEmail.value,
      emailVerified: profileEmail.verified === 'true' || (profileEmail.verified as unknown as boolean) === true,

      oauthProfileId: googleProfile.id,
      oauthProvider: 'google'
    })

    await this.unregisteredUserRepository.persistAndFlush(unregisteredUser)

    return unregisteredUser
  }
}
