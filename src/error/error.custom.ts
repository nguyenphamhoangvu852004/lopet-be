import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
export class HttpError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export class NotFound extends HttpError {
  constructor(message?: string) {
    super(httpStatusCode.NOT_FOUND, message ?? httpStatusMessage.NOT_FOUND)
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string) {
    super(httpStatusCode.BAD_REQUEST, message ?? httpStatusMessage.BAD_REQUEST)
  }
}

export class Conflict extends HttpError {
  constructor(message?: string) {
    super(httpStatusCode.CONFLICT, message ?? httpStatusMessage.CONFLICT)
  }
}

export class Forbidden extends HttpError {
  constructor(message?: string) {
    super(httpStatusCode.FORBIDDEN, message ?? httpStatusMessage.FORBIDDEN)
  }
}

export class InternalServerError extends HttpError {
  constructor() {
    super(httpStatusCode.INTERNAL_SERVER_ERROR, httpStatusMessage.INTERNAL_SERVER_ERROR)
  }
}
