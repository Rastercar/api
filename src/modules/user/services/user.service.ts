import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { Organization } from '../../organization/entities/organization.entity'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { RegisterUserDTO } from '../../auth/dtos/register-user.dto'
import { UserRepository } from '../repositories/user.repository'
import { PERMISSION } from '../../auth/constants/permissions'
import { UseRequestContext } from '@mikro-orm/nestjs'
import { Profile } from 'passport-google-oauth20'
import { User } from '../entities/user.entity'
import { Injectable } from '@nestjs/common'
import { MikroORM } from '@mikro-orm/core'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    // This is not used but is required because @UseRequestContext needs mikroorm in its context
    readonly orm: MikroORM,
    readonly userRepository: UserRepository,
    readonly organizationRepository: OrganizationRepository,
    readonly unregisteredUserRepository: UnregisteredUserRepository
  ) {}

  /**
   * Creates a new user and his organization, if the new user being registered refers to
   * a previously unregistered user the unregistered user data is used to fill the new user
   * oauth columns and the unregistered user row is deleted
   */
  @UseRequestContext()
  async registerUser(user: RegisterUserDTO): Promise<User> {
    const urUserOrNull = user.refersToUnregisteredUser
      ? await this.unregisteredUserRepository.findOne({ uuid: user.refersToUnregisteredUser })
      : null

    const emailVerified = urUserOrNull ? urUserOrNull.emailVerified : false

    const organizationToRegister = new Organization({
      name: user.username,
      billingEmail: user.email,
      billingEmailVerified: emailVerified
    })

    const userToRegister = new User({
      email: user.email,
      username: user.username,
      password: bcrypt.hashSync(user.password, 10),
      emailVerified,
      oauthProvider: urUserOrNull ? urUserOrNull.oauthProvider : null,
      oauthProfileId: urUserOrNull ? urUserOrNull.oauthProfileId : null,
      organization: organizationToRegister,
      accessLevel: new AccessLevel({
        name: 'admin',
        isFixed: true,
        description: '',
        organization: organizationToRegister,
        permissions: Object.values(PERMISSION)
      })
    })

    if (urUserOrNull !== null) {
      this.unregisteredUserRepository.remove(urUserOrNull)
    }

    await this.userRepository.persistAndFlush(userToRegister)

    const getUserAndSetHimAsTheOrganizationOwner = async () => {
      const createdUser = await this.userRepository.findOneOrFail({ email: userToRegister.email }, { populate: ['organization'] })

      createdUser.organization.owner = createdUser

      await this.organizationRepository.persistAndFlush(createdUser.organization)

      return createdUser
    }

    return getUserAndSetHimAsTheOrganizationOwner()
  }

  @UseRequestContext()
  async createOrFindUnregisteredUserForGoogleProfile(googleProfile: Profile): Promise<UnregisteredUser> {
    const existingUrUser = await this.unregisteredUserRepository.findOne({ oauthProfileId: googleProfile.id, oauthProvider: 'google' })

    if (existingUrUser) return existingUrUser

    const profileEmail = googleProfile.emails?.[0] ?? { value: undefined, verified: 'false' }

    const unregisteredUser = new UnregisteredUser({
      username: googleProfile.username,
      email: profileEmail.value,
      // Sometimes the verified prop comes as boolean despite the typing
      emailVerified: profileEmail.verified === 'true' || (profileEmail.verified as unknown as boolean) === true,
      oauthProfileId: googleProfile.id,
      oauthProvider: 'google'
    })

    await this.unregisteredUserRepository.persistAndFlush(unregisteredUser)

    return unregisteredUser
  }
}
