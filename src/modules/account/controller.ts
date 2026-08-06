import { IAccountService } from '~/modules/account/services/IAccountService'
import { Request, Response } from 'express'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'

export class AccountController {
  constructor(private service: IAccountService) {
    this.service = service
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const account = await this.service.getById(Number(id))
    sendResponse(
      new ApiResponse({
        data: account,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get account successfully'
      })
    )
    return
  }
  async getList(req: Request, res: Response) {
    const response = await this.service.getList()
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get list account successfully'
      })
    )
  }

  async getByUsername(req: Request, res: Response) {
    const username = req.params.username
    const account = await this.service.getByUsername(username)

    res.status(200).json({
      code: 200,
      message: 'success',
      data: account
    })
    return
  }
  async banId(req: Request, res: Response) {
    const { id } = req.params
    const account = await this.service.banId(Number(id))
    sendResponse(
      new ApiResponse({
        data: account,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Ban account successfully'
      })
    )
  }

  async unbanId(req: Request, res: Response) {
    const { id } = req.params
    const account = await this.service.unbanId(Number(id))
    sendResponse(
      new ApiResponse({
        data: account,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Unban account successfully'
      })
    )
  }
  async delete(req: Request, res: Response) {
    const response = await this.service.delete(Number(req.params.id))
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Delete account successfully',
        data: response
      })
    )
  }
  async getSuggest(req: Request, res: Response) {
    const limit = Number(req.query.limit)
    const response = await this.service.getSuggest(Number(req.user.id), limit)
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get suggest account successfully'
      })
    )
  }
  async setRolesToAccount(req: Request, res: Response) {
    const { userId, roles } = req.body
    console.log(userId, roles)
    const account = await this.service.setRolesToAccount(userId, roles)
    sendResponse(
      new ApiResponse({
        data: account,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Set roles to account successfully'
      })
    )
    return
  }
}
