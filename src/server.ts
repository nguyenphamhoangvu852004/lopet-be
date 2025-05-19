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
import cors from 'cors'
import { testRouter } from '~/routes/test'

// DATABASE
function startDatabase() {
  appDataSource
    .initialize()
    .then(() => logger.info('Database connected succesfully'))
    .catch((error) => {
      logger.error((error as Error).message)
    })
}

// APPLICATION
export async function startServer() {
  const app: core.Express = express()
  const route: core.Router = express.Router()
  const server = createServer(app)
  app.use(express.json({ strict: true }))
  app.use(express.urlencoded({ extended: true }))
  app.use(
    cors({
      origin: ['*', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  const io = new Server(server, {
    cors: {
      origin: ['*', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  })
  route.use('/test', testRouter)
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
  startDatabase()
  server.listen(PORT, function () {
    logger.info(`Server started at ${HOSTNAME}:${PORT}`)
  })
}
