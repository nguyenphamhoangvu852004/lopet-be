import dotenv from 'dotenv'
dotenv.config()

export const environment = {
  APP_PORT: Number(process.env.APP_PORT),
  APP_HOSTNAME: process.env.APP_HOSTNAME,

  DATABASE_HOSTNAME: process.env.DATABASE_HOST,
  DATABASE_PORT: Number(process.env.DATABASE_PORT),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}
