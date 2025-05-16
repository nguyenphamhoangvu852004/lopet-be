import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { environment } from '~/config/env'

const logLevels = {
  error: 0,
  warning: 1,
  info: 2,
  http: 3,
  debug: 4
}

export const logger = winston.createLogger({
  levels: logLevels,
  level: environment.LOG_LEVEL,
  silent: false,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    winston.format.printf(({ timestamp, level, message, stack, ...logMetadata }) => {
      return ` ${timestamp} ${level}: ${message} ${stack ? stack : ''} ${JSON.stringify(logMetadata)}`
    })
  )
  //   transports: [new winston.transports.Console()]
})

const fileRountineTransport = new DailyRotateFile({
  filename: 'application-%DATE%.log',
  dirname: 'logs/',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  )
})

logger.add(fileRountineTransport)
