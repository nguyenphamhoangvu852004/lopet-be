import morgan from 'morgan'
import { logger } from './logger'

// Tạo stream để redirect log từ morgan vào Winston
const stream = {
  write: (message: string) => {
    // remove newline do morgan tự thêm
    logger.http(message.trim())
  }
}

// Bỏ qua logging trong test
const skip = () => {
  return process.env.NODE_ENV === 'test'
}

// Tạo middleware morgan sử dụng custom stream
export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms :remote-addr :user-agent',
  { stream, skip }
)
