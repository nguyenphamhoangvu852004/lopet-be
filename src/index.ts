import { startMysql, startRedis, startServer, stopServer } from './server'
import { logger } from './config/logger'
import InitRole from '~/modules/role/init.role'

async function main() {
  try {
    await startMysql()
    await startRedis()
    await startServer()
    new InitRole()
    process.on('SIGINT', async () => {
      logger.info('SIGINT received: stopping server...')
      await stopServer()
      logger.info('Exiting process...')
      process.exit(0)
    })
  } catch (error) {
    logger.error('Failed to start server: ' + (error as Error).message)
    process.exit(1)
  }
}

main()
