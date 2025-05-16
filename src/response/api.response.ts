import { Response } from 'express'
interface IResponse {
  send(res: Response, statusCode: number, data: any): void
}
export class SuccesstionResponseImpl implements IResponse {
  send(res: Response, statusCode: number, data: any): void {
    res.status(statusCode).json(data)
    return
  }
}

export class ApiResponse {
  res!: Response
  statusCode!: number
  message!: string
  data!: any
  constructor(data?: Partial<ApiResponse>) {
    Object.assign(this, data)
  }
}

// export function sendResponse(data: ApiResponse): void {
//     data.res.status(data.statusCode).json({
//         statusCode: data.statusCode,
//         message: data.message,
//         data: data.data
//     })
//     return
// }

export function sendResponse(data: ApiResponse): void {
  data.res.status(data.statusCode).json({
    statusCode: data.statusCode,
    message: data.message,
    data: data.data
  })
  return
}
