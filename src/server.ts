import express from 'express'
import core from 'express-serve-static-core'
import { environment } from 'src/config/env'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { appDataSource } from '~/config/appDataSource'
import { router } from '~/routes/index'
import { logger } from '~/config/logger'

const PORT = environment.APP_PORT
const HOSTNAME = environment.APP_HOSTNAME

export async function startDatabase() {
  try {
    await appDataSource.initialize()
    logger.info('Database connected succesfully')
  } catch (error) {
    logger.error((error as Error).message)
  }
}
export async function startServer() {
  const app: core.Express = express()
  const route: core.Router = express.Router()
  const server = createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  route.use('/v1', router)

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
  await startDatabase()
  server.listen(PORT, function () {
    logger.info(`Server started at ${HOSTNAME}:${PORT}`)
  })
}
