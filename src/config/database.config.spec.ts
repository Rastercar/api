import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'dotenv'

describe('Database Config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('Loads the .development.env env vars whenever NODE_ENV is not set', () => {
    const dbConfigFactory = require('./database.config').default

    const devConfig = parse(readFileSync(resolve('env', '.development.env')))
    const dbConfig = dbConfigFactory()

    expect(dbConfig.dbName).toBe(devConfig.POSTGRES_DB)
    expect(dbConfig.user).toBe(devConfig.POSTGRES_USER)
    expect(dbConfig.password).toBe(devConfig.POSTGRES_PASSWORD)
  })
})
