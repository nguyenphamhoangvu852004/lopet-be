import { createClient } from 'redis'
import { DataSource } from 'typeorm'
import { environment } from '~/config/env'

import path from 'path'
export const mySqlDataSource = new DataSource({
  type: 'mysql',
  host: environment.DATABASE_HOSTNAME,
  port: environment.DATABASE_PORT,
  username: environment.DATABASE_USERNAME,
  password: environment.DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  entities: [path.join(__dirname, '/../entities/*.entity.{ts,js}')],
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
