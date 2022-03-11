import { LoginResponse } from '../../src/modules/auth/models/login-response.model'
import { defaultTestUser } from '../../src/database/seeders/user.seeder'
import { GraphQLErrorExtensions } from 'graphql'
import { Response } from 'supertest'
import * as request from 'supertest'
import { Server } from 'http'

/**
 * Attempts to get the first error extension from a graphql request
 *
 * @param res - supertest request response
 */
export const getGqlFirstErrorExtension = (res: Response): GraphQLErrorExtensions | null => {
  const firstError = res.body?.errors?.[0] || {}
  return firstError?.extensions ?? null
}

/**
 * Fires a login request and retrieves the token for
 * the default test user, it is expected the users
 * fixture was loaded and the app server is was started with app.init()
 */
export const loginForTestuser = async (server: Server): Promise<LoginResponse> => {
  const response = await request(server).post('/auth/login').send({ email: defaultTestUser.email, password: 'testuser' })

  if (!response.body.user || !response.body.token) throw new Error('Cannot login as default user')
  return response.body
}
