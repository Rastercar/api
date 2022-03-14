import * as Joi from 'joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'homolog', 'production', 'test').required(),
  API_PORT: Joi.number().required(),

  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),

  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_UPLOADS_BUCKET_NAME: Joi.string().required(),

  DB_HOST: Joi.string(),
  DB_PORT: Joi.number(),
  DB_DEBUG_MODE: Joi.boolean().required(),

  JWT_DEFAULT_TTL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(10).required(),

  GOOGLE_OAUTH_CLIENT_ID: Joi.string().min(10).required(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().min(10).required(),

  API_BASE_URL: Joi.string().required(),
  PWA_BASE_URL: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  NO_REPLY_EMAIL: Joi.string().required()
})
