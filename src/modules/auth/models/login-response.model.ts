import { MasterUserModel } from '../../user/models/master-user.model'
import { createUnionType, Field, ObjectType } from '@nestjs/graphql'
import { UserModel } from '../../user/models/user.model'
import { is } from '../../../utils/coverage-helpers'
import { JwtModel } from './jwt.model'

export const UserOrMasterUser = createUnionType({
  name: 'UserOrMasterUser',
  resolveType: userOrMasterUser => {
    const userFields: (keyof UserModel | 'organization')[] = ['organization', 'googleProfileId']
    if (userFields.some(userField => userOrMasterUser[userField])) return UserModel

    const masterUserFields: (keyof MasterUserModel | 'masterAccessLevel')[] = ['masterAccessLevel']
    if (masterUserFields.some(masterUserField => userOrMasterUser[masterUserField])) return MasterUserModel

    return null
  },
  types: () => [UserModel, MasterUserModel]
})

@ObjectType()
export class LoginResponse {
  @Field()
  token!: JwtModel

  @Field(is(UserOrMasterUser))
  user!: typeof UserOrMasterUser
}
