/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express'

export class ApiResponse {
  res!: Response
  statusCode!: number
  message!: string
  data!: any
  constructor(data?: Partial<ApiResponse>) {
    Object.assign(this, data)
  }
}

export function sendResponse(data: ApiResponse): void {
  data.res.status(data.statusCode).json({
    statusCode: data.statusCode,
    message: data.message,
    data: data.data
  })
  return
}
