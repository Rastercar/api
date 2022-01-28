import * as Joi from 'joi'

export const validationSchema = Joi.object({
  API_PORT: Joi.number().required(),

  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),

  DB_HOST: Joi.string(),
  DB_PORT: Joi.number(),
  DB_DEBUG_MODE: Joi.boolean().required(),

  JWT_DEFAULT_TTL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(10).required(),

  GOOGLE_OAUTH_CLIENT_ID: Joi.string().min(10).required(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().min(10).required(),

  API_BASE_URL: Joi.string().required(),
  PWA_BASE_URL: Joi.string().required()
})
