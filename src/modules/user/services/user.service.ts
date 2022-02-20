import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { Organization } from '../../organization/entities/organization.entity'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { RegisterUserDTO } from '../../auth/dtos/register-user.dto'
import { UserRepository } from '../repositories/user.repository'
import { PERMISSION } from '../../auth/constants/permissions'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { AuthService } from '../../auth/auth.service'
import { Profile } from 'passport-google-oauth20'
import { User } from '../entities/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ERROR_CODES } from '../../../constants/error.codes'

@Injectable()
export class UserService {
  constructor(
    readonly authService: AuthService,
    readonly userRepository: UserRepository,
    readonly organizationRepository: OrganizationRepository,
    readonly unregisteredUserRepository: UnregisteredUserRepository
  ) {}

  /**
   * Creates a new user and his organization, if the new user being registered refers to
   * a previously unregistered user the unregistered user data is used to fill the new user
   * oauth columns and the unregistered user row is deleted
   */
  async registerUser(user: RegisterUserDTO): Promise<User> {
    await this.authService.checkEmailAddressInUse(user.email, { throwExceptionIfInUse: true })

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
      googleProfileId: urUserOrNull?.oauthProfileId && urUserOrNull.oauthProvider === 'google' ? urUserOrNull.oauthProfileId : null,
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

  async updateUser(userToUpdate: User, newData: UpdateUserDTO): Promise<User> {
    const { password, email, username, removeGoogleProfileLink, oldPassword } = newData

    if (newData.email && newData.email !== userToUpdate.email) {
      await this.authService.checkEmailAddressInUse(newData.email, { throwExceptionIfInUse: true })
    }

    if (password && oldPassword) {
      const oldPasswordIsValid = await this.authService.comparePasswords(oldPassword, userToUpdate.password as string)
      if (!oldPasswordIsValid) throw new BadRequestException(ERROR_CODES.OLD_PASSWORD_INVALID)
      userToUpdate.password = bcrypt.hashSync(password, 10)
    }

    if (removeGoogleProfileLink) userToUpdate.googleProfileId = null
    if (username) userToUpdate.username = username
    if (email) userToUpdate.email = email

    await this.userRepository.persistAndFlush(userToUpdate)

    return userToUpdate
  }

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
