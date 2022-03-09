import { ObjectType } from '@nestjs/graphql'
import { BaseUserModel } from './user.model'

@ObjectType({ description: 'master user (a user with access to the main panel)' })
export class MasterUserModel extends BaseUserModel {}
