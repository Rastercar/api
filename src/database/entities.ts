import { UnregisteredUser } from '../modules/user/entities/unregistered-user.entity'
import { Organization } from '../modules/organization/entities/organization.entity'
import { AccessLevel } from '../modules/auth/entities/access-level.entity'
import { User } from '../modules/user/entities/user.entity'

export const entities = [User, UnregisteredUser, Organization, AccessLevel]
