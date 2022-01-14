import { createAppTestingModule } from '../../../test/utils/create-app'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

describe('e2e: HealthCheckController', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createAppTestingModule()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/healthcheck (GET) - just responds with a ok message', () => {
    return request(app.getHttpServer()).get('/healthcheck').expect(200).expect('ok')
  })
})
