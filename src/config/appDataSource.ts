import { DataSource } from 'typeorm'
import { environment } from '~/config/env'

export const appDataSource = new DataSource({
  type: 'mysql',
  host: environment.DATABASE_HOSTNAME,
  port: environment.DATABASE_PORT,
  username: environment.DATABASE_USERNAME,
  password: environment.DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  entities: [__dirname + '/../entities/*.entity.ts'],
  synchronize: true,
  logging: true
  // subscribers: [],
  // migrations: []
})
