import * as Joi from 'joi'
import * as fs from 'fs'

const definedEnviromentFileNames = fs
  .readdirSync('env')
  .map(envFileName => envFileName.replace('.env', '').replace(/\W/g, ''))
  .filter(envFileName => envFileName !== 'example')

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...definedEnviromentFileNames)
    .required(),

  API_PORT: Joi.number().required(),

  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),

  DB_DEBUG_MODE: Joi.boolean().required(),

  JWT_DEFAULT_TTL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(10).required(),

  GOOGLE_OAUTH_CLIENT_ID: Joi.string().min(10).required(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().min(10).required()
})
