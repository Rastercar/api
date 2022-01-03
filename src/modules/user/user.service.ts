import { UnregisteredUserRepository } from './repositories/unregistered-user.repository'
import { UnregisteredUser } from './entities/unregistered-user.entity'
import { RegisterUserDTO } from '../auth/dtos/register-user.dto'
import { UserRepository } from './repositories/user.repository'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { Profile } from 'passport-google-oauth20'
import { User } from './entities/user.entity'
import { Injectable } from '@nestjs/common'
import { MikroORM } from '@mikro-orm/core'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    readonly orm: MikroORM,
    readonly userRepository: UserRepository,
    readonly unregisteredUserRepository: UnregisteredUserRepository
  ) {}

  /**
   * Creates a new user, if the new user being registered refers to a previously
   * unregistered user the unregistered user data is used to fill the new user oauth
   * columns and the unregistered user row is deleted
   */
  @UseRequestContext()
  async registerUser(user: RegisterUserDTO): Promise<User> {
    const urUserOrNull = user.refersToUnregisteredUser
      ? await this.unregisteredUserRepository.findOne({ uuid: user.refersToUnregisteredUser })
      : null

    const userToRegister = new User({
      email: user.email,
      username: user.username,
      password: bcrypt.hashSync(user.password, 10),
      emailVerified: urUserOrNull ? urUserOrNull.emailVerified : false,
      oauthProfileId: urUserOrNull ? urUserOrNull.oauthProfileId : null,
      oauthProvider: urUserOrNull ? urUserOrNull.oauthProvider : null
    })

    if (urUserOrNull !== null) {
      this.unregisteredUserRepository.remove(urUserOrNull)
    }

    await this.userRepository.persistAndFlush(userToRegister)

    return this.userRepository.findOneOrFail({ email: userToRegister.email })
  }

  @UseRequestContext()
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
