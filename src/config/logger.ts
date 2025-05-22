import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { environment } from '~/config/env'

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
}

export const logger = winston.createLogger({
  levels: logLevels.levels,
  level: environment.LOG_LEVEL,
  silent: false,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    winston.format.printf(({ timestamp, level, message, stack, ...logMetadata }) => {
      return ` ${timestamp} ${level}: ${message} ${stack ? stack : ''} ${JSON.stringify(logMetadata)}`
    })
  ),
  transports: [
    new winston.transports.Console()
    //   new winston.transports.File({ filename: 'logs/combined.log' }),
    //   new winston.transports.File({ filename: 'logs/http.log', level: 'http' })
  ]
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
    // winston.format.json(),
    winston.format.colorize()
  )
})

logger.add(fileRountineTransport)
