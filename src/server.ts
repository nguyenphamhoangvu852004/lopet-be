import express from 'express'
import core from 'express-serve-static-core'
import { environment } from 'src/config/env'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { mySqlDataSource, redis } from '~/config/appDataSource'
import { router } from '~/routes/index'
import { logger } from '~/config/logger'
import cors from 'cors'
import { morganMiddleware } from '~/config/morgan'
import { setupSocket } from '~/middlewares/socketio'
import InitAdmin from '~/modules/admin/init.admin'
import InitRole from '~/modules/role/init.role'

const PORT = environment.APP_PORT
const HOSTNAME = environment.APP_HOSTNAME
export const app: core.Express = express()
export const server = createServer(app)
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
})

const route: core.Router = express.Router()
export async function startMysql() {
  try {
    await mySqlDataSource.initialize()
    logger.info('Database connected succesfully')
  } catch (error) {
    if (error instanceof AggregateError) {
      for (const err of error.errors) {
        logger.error('MySQL init error detail:', err)
      }
    } else {
      logger.error('MySQL init error:', error)
    }
  }
}
export async function stopMysql() {
  try {
    await mySqlDataSource.destroy()
    logger.info('Database disconnected successfully')
    return
  } catch (error) {
    logger.error(error)
    return
  }
}
export async function startRedis() {
  try {
    const result = await redis.connect()
    if (result) {
      logger.info('Redis connected successfully')
    }
    await redis.set('test', 'Hello world')
  } catch (error) {
    logger.error('Redis connected error ', error)
  }
}
export async function stopRedis() {
  try {
    await redis.disconnect()
    logger.info('Redis disconnected successfully')
  } catch (error) {
    logger.error(error)
  }
}
export async function startServer() {
  app.use(express.json({ strict: true }))
  app.use(express.urlencoded({ extended: true }))
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
      ]
    })
  )
  route.use(morganMiddleware)
  route.use('/v1', router)

  setupSocket(io)

  app.use((req, res, next) => {
    res.io = io
    next()
  })
  app.use(route)

  new InitRole()
  const newInitAdmin = new InitAdmin()
  newInitAdmin.init()

  await new Promise<void>((resolve) => {
    server.listen(PORT, async () => {
      logger.info(`Server started at ${HOSTNAME}:${PORT}`)
      resolve()
    })
  })
}
export async function stopServer() {
  return new Promise<void>((resolve, reject) => {
    const shutdown = async () => {
      try {
        await stopMysql()
        await stopRedis()
        server.close((err) => {
          if (err) {
            logger.error('Error closing server', err)
            reject(err)
            return
          }
          logger.info('Server stopped successfully')
          resolve()
        })
      } catch (error) {
        logger.error(error)
        reject(error)
      }
    }
    shutdown()
  })
}
