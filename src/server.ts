import express from 'express'
import core from 'express-serve-static-core'
import { environment } from 'src/config/env'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { router } from '~/routes/index'
import { logger } from '~/config/logger'
import { setupSocket, socketIOMiddleware } from '~/middlewares/socketio'
import { globalExceptionMiddleware } from './middlewares/globalExceptionHandler.middleware'
import { corsMiddleware } from './middlewares/cors.middleware'
import { mySqlDataSource } from './config/appDataSource'

export async function startServer() {
  const PORT = environment.APP_PORT
  const HOSTNAME = environment.APP_HOSTNAME
  const app: core.Express = express()
  const server = createServer(app)
  const socketIO = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  })
  setupSocket(socketIO)

  const route: core.Router = express.Router()
  app.use(express.json({ strict: true }))
  app.use(express.urlencoded({ extended: true }))
  app.use(corsMiddleware)
  app.use(socketIOMiddleware(socketIO))
  app.use(route)
  mySqlDataSource.initialize()

  route.use('/v1', router)
  route.use(globalExceptionMiddleware)
  server.listen(PORT, async () => {
    logger.info(`Server started at ${HOSTNAME}:${PORT}`)
  })
}
