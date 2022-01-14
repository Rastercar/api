import { createAppTestingModule } from '../../../test/utils/create-app'
import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Server } from 'http'
import { clearDatabase } from '../../../test/database/clear-database'
import { MikroORM } from '@mikro-orm/core'

describe('e2e: AuthController / AuthResolver', () => {
  let app: INestApplication
  let server: Server

  beforeAll(async () => {
    app = await createAppTestingModule()
    server = app.getHttpServer()
    await clearDatabase(app.get(MikroORM))
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
})
