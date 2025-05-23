import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
export class HttpError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = new.target.name
  }
}

export class NotFound extends HttpError {
  constructor() {
    super(httpStatusCode.NOT_FOUND, httpStatusMessage.NOT_FOUND)
  }
}

export class BadRequest extends HttpError {
  constructor() {
    super(httpStatusCode.BAD_REQUEST, httpStatusMessage.BAD_REQUEST)
  }
}

export class Conflict extends HttpError {
  constructor() {
    super(httpStatusCode.CONFLICT, httpStatusMessage.CONFLICT)
  }
}
export class InternalServerError extends HttpError {
  constructor() {
    super(httpStatusCode.INTERNAL_SERVER_ERROR, httpStatusMessage.INTERNAL_SERVER_ERROR)
  }
}
