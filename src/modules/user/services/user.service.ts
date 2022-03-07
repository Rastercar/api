import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, UnregisteredUser, User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { Profile } from 'passport-google-oauth20'

import { ERROR_CODES } from '../../../constants/error.codes'
import { PrismaService } from '../../../database/prisma.service'
import { PERMISSION } from '../../auth/constants/permissions'
import { RegisterUserDTO } from '../../auth/dtos/register-user.dto'
import { AuthService } from '../../auth/services/auth.service'
import { UpdateUserDTO } from '../dtos/update-user.dto'

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
  constructor(readonly prisma: PrismaService, readonly authService: AuthService) {}

  /**
   * Creates a new user and his organization, if the new user being registered refers to
   * a previously unregistered user the unregistered user data is used to fill the new user
   * oauth columns and the unregistered user row is deleted
   */
  async registerUser(dto: RegisterUserDTO): Promise<User> {
    await this.authService.checkEmailAddressInUse(dto.email, { throwExceptionIfInUse: true })

    const urUserOrNull = dto.refersToUnregisteredUser
      ? await this.prisma.unregisteredUser.findUnique({ where: { uuid: dto.refersToUnregisteredUser } })
      : null

    const emailVerified = urUserOrNull ? urUserOrNull.emailVerified : false

    const { user, organization } = await this.prisma.$transaction(async prisma => {
      const organization = await prisma.organization.create({
        data: {
          blocked: false,
          name: dto.username,
          billingEmail: dto.email,
          billingEmailVerified: emailVerified
        }
      })

      const googleProfileId = urUserOrNull?.oauthProfileId && urUserOrNull.oauthProvider === 'google' ? urUserOrNull.oauthProfileId : null

      const user = await prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: bcrypt.hashSync(dto.password, 10),
          emailVerified,
          googleProfileId,
          organization: {
            connect: { id: organization.id }
          },
          accessLevel: {
            create: {
              name: 'admin',
              isFixed: true,
              description: '',
              permissions: Object.values(PERMISSION)
            }
          }
        }
      })

      if (urUserOrNull !== null) {
        prisma.unregisteredUser.delete({ where: { uuid: urUserOrNull.uuid } })
      }

      return { user, organization }
    })

    // Set the user as the his organization owner
    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        owner: { connect: { id: user.id } }
      }
    })

    return user
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

    const data: Prisma.UserUpdateInput = {}

    if (email && email !== userToUpdate.email) {
      await this.authService.checkEmailAddressInUse(email, { throwExceptionIfInUse: true })
    }

    if (newPassword) {
      if (oldPasswordVerification) {
        const oldPasswordIsValid = await this.authService.comparePasswords(oldPasswordVerification, userToUpdate.password as string)
        if (!oldPasswordIsValid) throw new BadRequestException(ERROR_CODES.OLD_PASSWORD_INVALID)
      }

      data.password = bcrypt.hashSync(newPassword, 10)
    }

    if (typeof emailVerified === 'boolean') {
      const org = await this.prisma.user.findUnique({ where: { id: userToUpdate.organizationId } }).ownedOrganization()

      // If the user owns a organization with the same email address
      // and were updating the emailVerifiedStatus we can set the org
      // billingEmailVerified to the same value
      if (org?.billingEmail === userToUpdate.email) {
        org.billingEmailVerified = emailVerified
        await this.prisma.organization.update({
          where: { id: org.id },
          data: { billingEmailVerified: emailVerified }
        })
      }

      data.emailVerified = emailVerified
    }

    if (googleProfileId) data.googleProfileId = googleProfileId
    if (removeGoogleProfileLink) data.googleProfileId = null
    if (username) data.username = username

    if (email) {
      // If were changing the email we assume its unverified unless told otherwise
      data.emailVerified = emailVerified ?? false
      data.email = email
    }

    const user = await this.prisma.user.update({
      where: { id: userToUpdate.id },
      data
    })

    return user
  }

  getUserForGoogleProfile(googleProfileId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleProfileId } })
  }

  async createOrFindUnregisteredUserForGoogleProfile(googleProfile: Profile): Promise<UnregisteredUser> {
    const existingUrUser = await this.prisma.unregisteredUser.findFirst({
      where: {
        oauthProvider: 'google',
        oauthProfileId: googleProfile.id
      }
    })

    if (existingUrUser) return existingUrUser

    const profileEmail = googleProfile.emails?.[0] ?? { value: undefined, verified: 'false' }

    return this.prisma.unregisteredUser.create({
      data: {
        username: googleProfile.username,
        email: profileEmail.value,
        // Sometimes the verified prop comes as boolean despite the typing
        emailVerified: profileEmail.verified === 'true' || (profileEmail.verified as unknown as boolean) === true,
        oauthProfileId: googleProfile.id,
        oauthProvider: 'google'
      }
    })
  }
}
