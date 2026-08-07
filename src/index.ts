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
import { mySqlDataSource, redis } from './config/appDataSource'
import { transporter } from './config/emailConfig'
import { seedAuthorization } from '~/authz/permission.seed'
import InitAdmin from '~/modules/admin/init.admin'

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
route.use('/v1', router)
route.use(globalExceptionMiddleware)

/**
 * Trước đây initialize() không được await và phần seed role/admin không hề
 * được gọi ở đâu, nên bảng roles luôn rỗng và không tài khoản nào là ADMIN.
 * Giờ khởi động tuần tự: DB -> seed phân quyền -> tài khoản admin -> listen.
 */
async function bootstrap() {
  await mySqlDataSource.initialize()
  await redis.connect()

  try {
    await transporter.verify()
    logger.info('SMTP is ready')
  } catch (error) {
    logger.error(`SMTP verify failed: ${error}`)
  }

  await seedAuthorization()
  await new InitAdmin().init()

  server.listen(PORT, () => {
    logger.info(`Server started at ${HOSTNAME}:${PORT}`)
  })
}

bootstrap().catch((error) => {
  logger.error(`Bootstrap failed: ${error}`)
  process.exit(1)
})
