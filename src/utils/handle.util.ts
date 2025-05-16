import { HttpError, InternalServerError } from '~/error/error.custom'
import { httpStatusCode } from '~/global/httpStatusCode'
import { sendResponse, ApiResponse } from '~/response/api.response'
import { Response } from 'express'
export function handleThrowError(error: unknown): never {
  if (error instanceof HttpError) {
    throw error
  } else {
    throw new InternalServerError()
  }
}

export function handleControllerError(error: unknown, res: Response) {
  if (error instanceof HttpError) {
    sendResponse(
      new ApiResponse({
        res,
        statusCode: error.code,
        message: error.message
      })
    )
  } else {
    sendResponse(
      new ApiResponse({
        res,
        statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Lỗi không xác định'
      })
    )
  }
}
