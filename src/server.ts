import express from 'express'
import core from 'express-serve-static-core'
import { environment } from 'src/config/env'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { mySqlDataSource, redis } from '~/config/appDataSource'
import { router } from '~/routes/index'
import { logger } from '~/config/logger'
import cors from 'cors'
import { testRouter } from '~/routes/test'
import { morganMiddleware } from '~/config/morgan'
const PORT = environment.APP_PORT
const HOSTNAME = environment.APP_HOSTNAME

export const app: core.Express = express()
export const server = createServer(app)

const route: core.Router = express.Router()
export async function startMysql() {
  try {
    await mySqlDataSource.initialize()
    logger.info('Database connected succesfully')
    return
  } catch (error) {
    logger.error((error as Error).message)
    return
  }
}
export async function stopMysql() {
  try {
    await mySqlDataSource.destroy()
    logger.info('Database disconnected successfully')
    return
  } catch (error) {
    logger.error((error as Error).message)
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
    logger.error('Redis connected error ', (error as Error).message)
  }
}
export async function stopRedis() {
  try {
    await redis.disconnect()
    logger.info('Redis disconnected successfully')
  } catch (error) {
    logger.error((error as Error).message)
  }
}
export async function startServer() {
  app.use(express.json({ strict: true }))
  app.use(express.urlencoded({ extended: true }))
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
    })
  )
  route.use(morganMiddleware)
  route.use('/test', testRouter)
  route.use('/v1', router)

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  })

  io.on('connection', function (socket) {
    console.log('a user connected', socket.id)
    socket.on('register', function (msg) {
      console.log(msg)
    })

    socket.on('join room', function (room) {
      socket.join(room)
      console.log(`${socket.id} has joined room ${room}`)
    })

    socket.on('private message', function (data) {
      const { to, from, message, room } = data
      console.log(`${from} to ${to}: ${message}`)
      socket.to(room).emit('private message', { from, to, message })
    })
  })

  app.use(route)

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
        logger.error((error as Error).message)
        reject(error)
      }
    }
    shutdown()
  })
}
