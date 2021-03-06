import { loginForTestuser, getGqlFirstErrorExtension } from '../../../test/utils/e2e.utils'
import { defaultTestUser } from '../../../test/database/fixtures/user.fixtures'
import { createAppTestingModule } from '../../../test/utils/create-app'
import { UserRepository } from '../user/repositories/user.repository'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { RegisterUserDTO } from './dtos/register-user.dto'
import { EntityManager } from '@mikro-orm/postgresql'
import { User } from '../user/entities/user.entity'
import * as request from 'supertest'
import * as bcrypt from 'bcrypt'
import { Server } from 'http'
import { ERROR_CODES } from '../../constants/error.codes'

// Hack for graphql syntax highlighting
const gql = String.raw

describe('e2e: AuthController / AuthResolver', () => {
  let userRepo: UserRepository
  let app: INestApplication
  let validUser: User
  let server: Server

  beforeAll(async () => {
    app = await createAppTestingModule({ clearDatabase: true, loadFixtures: true })
    server = app.getHttpServer()
    userRepo = app.get(UserRepository)

    const [firstUser] = await userRepo.find({}, { limit: 1, orderBy: { id: 'ASC' } })
    validUser = firstUser
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/auth/login (POST)', () => {
    it('validates the post body credentials', async () => {
      const res = await request(server).post('/auth/login').send({ email: 'invalid-email', password: null }).expect(HttpStatus.BAD_REQUEST)
      expect(res.body?.error).toBe('Invalid Login Request')
    })

    it('returns a 404 status code when a user is not found with the given email', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'validemail@gmail.com', password: '123456' })
        .expect(HttpStatus.NOT_FOUND)

      expect(res.body?.error).toBe('Not Found')
    })
  })

  it('/auth/google/login (GET) - redirects to the google oauth page', () => {
    return request(server).get('/auth/google/login').expect(HttpStatus.FOUND)
  })

  it('/auth/google/callback (GET) - redirects to the google oauth handler', async () => {
    const res = await request(server).get('/auth/google/callback').expect(HttpStatus.FOUND)

    const redirectTo = res.header['location']
    const redirectedToGoogle = typeof redirectTo === 'string' && redirectTo.startsWith('https://accounts.google')

    expect(redirectedToGoogle).toBe(true)
  })

  describe('resolver: isEmailInUse', () => {
    const createEmailInUseQuery = (email: string) => gql`
      query isEmailInUseQuery {
        isEmailInUse(email: "${email}")
      }
    `

    it('returns false if there is no user with the given email', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createEmailInUseQuery('xd@gmail.com') })
        .expect(HttpStatus.OK)

      expect(res.body?.data).toEqual({ isEmailInUse: false })
    })

    it('returns true if there is no user with the given email', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createEmailInUseQuery(validUser.email) })
        .expect(HttpStatus.OK)

      expect(res.body?.data).toEqual({ isEmailInUse: true })
    })
  })

  describe('resolver: login', () => {
    const validPassword = '12345'

    beforeAll(async () => {
      // Change the password manually to ensure its the same
      const password = '12345'
      validUser.password = bcrypt.hashSync(password, 1)
      await app.get(EntityManager).persistAndFlush(validUser)
    })

    const createLoginMutation = (args: { email: string; password: string }) => {
      return gql`
        mutation loginMutation {
          login(credentials: { email: "${args.email}", password: "${args.password}" }) {
            token {
              value
              type
            }
            user {
              id
              email
              username
              emailVerified
            }
          }
        }
      `
    }

    it('fails with BadRequestCode on invalid credentials input', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createLoginMutation({ email: 'invalidEmail', password: '12345' }) })

      const errorExtension = getGqlFirstErrorExtension(res)

      expect(errorExtension?.response?.statusCode).toBe(HttpStatus.BAD_REQUEST)
    })

    it('fails with NotFound when a user is not found by the email', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createLoginMutation({ email: 'valid.hard.to.find.email@gmail.com', password: '12345' }) })

      const errorExtension = getGqlFirstErrorExtension(res)

      expect(errorExtension?.response?.statusCode).toBe(HttpStatus.NOT_FOUND)
    })

    it('fails with Unauthorized when a user found but the password is invalid', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createLoginMutation({ email: validUser.email, password: 'nowaysomeonewouldusethispasswordlmao' }) })

      const errorExtension = getGqlFirstErrorExtension(res)

      expect(errorExtension?.response?.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('returns the user and its token on success', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createLoginMutation({ email: validUser.email, password: validPassword }) })
        .expect(HttpStatus.OK)

      const loginRes = res.body?.data?.login ?? {}

      const expectedToken = expect.objectContaining({ value: expect.any(String), type: 'bearer' })
      const expectedUser = expect.objectContaining({
        id: validUser.id,
        email: validUser.email,
        username: validUser.username,
        emailVerified: validUser.emailVerified
      })

      expect(loginRes.token).toEqual(expectedToken)
      expect(loginRes.user).toEqual(expectedUser)
    })
  })

  describe('resolver: me', () => {
    let authToken: string

    const query = gql`
      query currentUserQuery {
        me {
          id
          email
          username
          emailVerified
        }
      }
    `

    beforeAll(async () => {
      const { token } = await loginForTestuser(server)
      authToken = token.value
    })

    it('fails with a unauthorized status if no token is present is the request authorization header', async () => {
      const res = await request(server).post('/graphql').send({ query }).expect(HttpStatus.OK)
      const error = getGqlFirstErrorExtension(res)
      expect(error?.response?.statusCode).toEqual(HttpStatus.UNAUTHORIZED)
    })

    it('Retrieves the user that owns the token sent on the auth header', async () => {
      const res = await request(server).post('/graphql').set('authorization', `bearer ${authToken}`).send({ query }).expect(HttpStatus.OK)

      expect(res.body?.data).toEqual({
        me: {
          id: defaultTestUser.id,
          email: defaultTestUser.email,
          username: defaultTestUser.username,
          emailVerified: defaultTestUser.emailVerified
        }
      })
    })
  })

  describe('resolver: loginWithToken', () => {
    let authToken: string

    const createQuery = (token = '') => gql`
      mutation loginByTokenMutation {
        loginWithToken(token: "${token}") {
          token {
            value
            type
          }
          user {
            id
            email
            username
            emailVerified
          }
        }
      }
    `

    beforeAll(async () => {
      const { token } = await loginForTestuser(server)
      authToken = token.value
    })

    it('fails with a unauthorized status if no token is sent', async () => {
      const res = await request(server).post('/graphql').send({ query: createQuery() }).expect(HttpStatus.OK)
      const error = getGqlFirstErrorExtension(res)
      expect(error?.response?.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    })

    it('generates a new token and retrieves the user of the original token', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: createQuery(authToken) })
        .expect(HttpStatus.OK)

      expect(res.body?.data).toEqual({
        loginWithToken: {
          token: {
            type: 'bearer',
            value: expect.any(String)
          },
          user: {
            id: defaultTestUser.id,
            email: defaultTestUser.email,
            username: defaultTestUser.username,
            emailVerified: defaultTestUser.emailVerified
          }
        }
      })
    })
  })

  describe('resolver: register', () => {
    const registerUserDto: RegisterUserDTO = {
      email: 'register.user@gmail.com',
      password: 'Contabc12345!',
      username: 'batata123',
      refersToUnregisteredUser: null
    }

    const mutation = gql`
      mutation registerUserMutation($user: RegisterUserDTO!) {
        register(user: $user) {
          token {
            value
            type
          }
          user {
            id
            email
            username
            emailVerified
          }
        }
      }
    `

    it('fails with BadRequest code on invalid input', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: mutation, variables: { user: { ...registerUserDto, email: 'invalid_email' } } })

      const errorExtension = getGqlFirstErrorExtension(res)

      expect(errorExtension?.response?.statusCode).toBe(HttpStatus.BAD_REQUEST)
    })

    it('fails when the new user email address is in use', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: mutation, variables: { user: { ...registerUserDto, email: defaultTestUser.email } } })

      const errorExtension = getGqlFirstErrorExtension(res)

      expect(errorExtension?.response?.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(errorExtension?.response?.message).toBe(ERROR_CODES.EMAIL_IN_USE)
    })

    it('returns the registered user and its token on success', async () => {
      const res = await request(server)
        .post('/graphql')
        .send({ query: mutation, variables: { user: registerUserDto } })

      expect(res.body?.data).toEqual({
        register: {
          token: {
            type: 'bearer',
            value: expect.any(String)
          },
          user: {
            id: expect.any(Number),
            email: registerUserDto.email,
            username: registerUserDto.username,
            emailVerified: false
          }
        }
      })
    })
  })
})
