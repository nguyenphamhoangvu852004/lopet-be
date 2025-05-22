import { createClient } from 'redis'
import { DataSource } from 'typeorm'
import { environment } from '~/config/env'

export const mySqlDataSource = new DataSource({
  type: 'mysql',
  host: environment.DATABASE_HOSTNAME,
  port: environment.DATABASE_PORT,
  username: environment.DATABASE_USERNAME,
  password: environment.DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  entities: [__dirname + '/../entities/*.entity.ts'],
  synchronize: true,
  logging: false
  // subscribers: [],
  // migrations: []
})

export const redis = createClient({
  socket: {
    host: environment.REDIS_HOSTNAME, // hoặc 'localhost'
    port: environment.REDIS_PORT // port host map tới container Redis
  }
})
