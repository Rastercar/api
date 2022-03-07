import { RegisterUserDTO } from '../../auth/dtos/register-user.dto'
import { PrismaService } from '../../../database/prisma.service'
import { AuthService } from '../../auth/services/auth.service'
import { PERMISSION } from '../../auth/constants/permissions'
import { UpdateUserDTO } from '../dtos/update-user.dto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, unregistered_user, user } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { ERROR_CODES } from '../../../constants/error.codes'
import { Profile } from 'passport-google-oauth20'

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
  async registerUser(dto: RegisterUserDTO): Promise<user> {
    await this.authService.checkEmailAddressInUse(dto.email, { throwExceptionIfInUse: true })

    const urUserOrNull = dto.refersToUnregisteredUser
      ? await this.prisma.unregistered_user.findUnique({ where: { uuid: dto.refersToUnregisteredUser } })
      : null

    const emailVerified = urUserOrNull ? urUserOrNull.email_verified : false

    const { user, organization } = await this.prisma.$transaction(async prisma => {
      const organization = await prisma.organization.create({
        data: {
          blocked: false,
          name: dto.username,
          billing_email: dto.email,
          billing_email_verified: emailVerified
        }
      })

      const google_profile_id =
        urUserOrNull?.oauth_profile_id && urUserOrNull.oauth_provider === 'google' ? urUserOrNull.oauth_profile_id : null

      const user = await prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: bcrypt.hashSync(dto.password, 10),
          email_verified: emailVerified,
          google_profile_id,
          organization: {
            connect: { id: organization.id }
          },
          access_level: {
            create: {
              name: 'admin',
              is_fixed: true,
              description: '',
              permissions: Object.values(PERMISSION)
            }
          }
        }
      })

      if (urUserOrNull !== null) {
        prisma.unregistered_user.delete({ where: { uuid: urUserOrNull.uuid } })
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

  async updateUser(userToUpdate: user, newData: UpdateUserData): Promise<user> {
    const {
      email,
      username,
      emailVerified,
      googleProfileId,
      password: newPassword,
      removeGoogleProfileLink,
      oldPassword: oldPasswordVerification
    } = newData

    const data: Prisma.userUpdateInput = {}

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
      const org = await this.prisma.user.findUnique({ where: { id: userToUpdate.organization_id } }).owned_organization()

      // If the user owns a organization with the same email address
      // and were updating the emailVerifiedStatus we can set the org
      // billingEmailVerified to the same value
      if (org?.billing_email === userToUpdate.email) {
        org.billing_email_verified = emailVerified
        await this.prisma.organization.update({
          where: { id: org.id },
          data: { billing_email_verified: emailVerified }
        })
      }

      data.email_verified = emailVerified
    }

    if (googleProfileId) data.google_profile_id = googleProfileId
    if (removeGoogleProfileLink) data.google_profile_id = null
    if (username) data.username = username

    if (email) {
      // If were changing the email we assume its unverified unless told otherwise
      data.email_verified = emailVerified ?? false
      data.email = email
    }

    const user = await this.prisma.user.update({
      where: { id: userToUpdate.id },
      data
    })

    return user
  }

  getUserForGoogleProfile(googleProfileId: string): Promise<user | null> {
    return this.prisma.user.findUnique({ where: { google_profile_id: googleProfileId } })
  }

  async createOrFindUnregisteredUserForGoogleProfile(googleProfile: Profile): Promise<unregistered_user> {
    const existingUrUser = await this.prisma.unregistered_user.findFirst({
      where: {
        oauth_provider: 'google',
        oauth_profile_id: googleProfile.id
      }
    })

    if (existingUrUser) return existingUrUser

    const profileEmail = googleProfile.emails?.[0] ?? { value: undefined, verified: 'false' }

    return this.prisma.unregistered_user.create({
      data: {
        username: googleProfile.username,
        email: profileEmail.value,
        // Sometimes the verified prop comes as boolean despite the typing
        email_verified: profileEmail.verified === 'true' || (profileEmail.verified as unknown as boolean) === true,
        oauth_profile_id: googleProfile.id,
        oauth_provider: 'google'
      }
    })
  }
}
