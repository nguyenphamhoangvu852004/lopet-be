import { HttpError } from '~/error/error.custom'

type ExceptionResponse = {
  statusCode: number
  message: string
}

export const globalExceptionMiddleware = (error: HttpError, req, res, next) => {
  const response: ExceptionResponse = {
    statusCode: error.code,
    message: error.message
  }
  res.status(error.code).json(response)
}
