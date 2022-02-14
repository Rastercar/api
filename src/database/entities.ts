import { MasterAccessLevel } from '../modules/auth/entities/master-access-level.entity'
import { UnregisteredUser } from '../modules/user/entities/unregistered-user.entity'
import { Organization } from '../modules/organization/entities/organization.entity'
import { AccessLevel } from '../modules/auth/entities/access-level.entity'
import { MasterUser } from '../modules/user/entities/master-user.entity'
import { User } from '../modules/user/entities/user.entity'

export const entities = [User, UnregisteredUser, Organization, AccessLevel, MasterAccessLevel, MasterUser]
