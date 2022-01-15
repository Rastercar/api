import { createAppTestingModule } from '../../../test/utils/create-app'
import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Server } from 'http'

describe('e2e: AuthController / AuthResolver', () => {
  let app: INestApplication
  let server: Server

  beforeAll(async () => {
    app = await createAppTestingModule({ clearDatabase: true, loadFixtures: true })
    server = app.getHttpServer()
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
})
