import { OrganizationRepository } from '../../organization/repositories/organization.repository'
import { UnregisteredUserRepository } from '../repositories/unregistered-user.repository'
import { Organization } from '../../organization/entities/organization.entity'
import { UnregisteredUser } from '../entities/unregistered-user.entity'
import { AccessLevel } from '../../auth/entities/access-level.entity'
import { RegisterUserDTO } from '../../auth/dtos/register-user.dto'
import { UserRepository } from '../repositories/user.repository'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PERMISSION } from '../../auth/constants/permissions'
import { ERROR_CODES } from '../../../constants/error.codes'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { AuthService } from '../../auth/services/auth.service'
import { Profile } from 'passport-google-oauth20'
import { User } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'

/*
 * Contains aditional fields that would be unreasonable
 * to leave in the UpdateUserDTO as this DTO contains fields
 * that require no aditional validation to be changed
 */
interface UpdateUserData extends UpdateUserDTO {
  emailVerified?: boolean
  googleProfileId?: string
}

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

  async updateUser(userToUpdate: User, newData: UpdateUserData): Promise<User> {
    const {
      email,
      username,
      emailVerified,
      googleProfileId,
      password: newPassword,
      removeGoogleProfileLink,
      oldPassword: oldPasswordVerification
    } = newData

    if (email && email !== userToUpdate.email) {
      await this.authService.checkEmailAddressInUse(email, { throwExceptionIfInUse: true })
    }

    if (newPassword && oldPasswordVerification) {
      const { password: currentPassword } = userToUpdate

      const oldPasswordIsValid = await this.authService.comparePasswords(oldPasswordVerification, currentPassword as string)
      if (!oldPasswordIsValid) throw new BadRequestException(ERROR_CODES.OLD_PASSWORD_INVALID)

      userToUpdate.password = bcrypt.hashSync(newPassword, 10)
    }

    if (typeof emailVerified === 'boolean') {
      // If the user owns a organization with the same email address
      // and were updating the emailVerifiedStatus we can set the org
      // billingEmailVerified to the same value
      if (userToUpdate.ownedOrganization?.billingEmail === userToUpdate.email) {
        userToUpdate.ownedOrganization.billingEmailVerified = emailVerified
      }

      userToUpdate.emailVerified = emailVerified
    }

    if (googleProfileId) userToUpdate.googleProfileId = googleProfileId
    if (removeGoogleProfileLink) userToUpdate.googleProfileId = null
    if (username) userToUpdate.username = username

    if (email) {
      // If were changing the email we assume its unverified unless told otherwise
      userToUpdate.emailVerified = emailVerified ?? false
      userToUpdate.email = email
    }

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
