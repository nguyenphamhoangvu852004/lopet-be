import { IAccountService } from '~/modules/account/services/IAccountService'
import { Request, Response } from 'express'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import { handleControllerError } from '~/utils/handle.util'
export class AccountController {
  constructor(private service: IAccountService) {
    this.service = service
  }

  async getById(req: Request, res: Response) {
    try {
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
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async getList(req: Request, res: Response) {
    try {
      const response = await this.service.getList()
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get list account successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  async getByUsername(req: Request, res: Response) {
    try {
      const username = req.params.username
      const account = await this.service.getByUsername(username)

      res.status(200).json({
        code: 200,
        message: 'success',
        data: account
      })
      return
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: (error as Error).message,
        data: error
      })
      return
    }
  }
  async banId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const account = await this.service.banId(Number(id))
      sendResponse(
        new ApiResponse({ data: account, res: res, statusCode: httpStatusCode.OK, message: 'Ban account successfully' })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  async unbanId(req: Request, res: Response) {
    try {
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
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const response = await this.service.delete(Number(req.params.id))
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Delete account successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getSuggest(req: Request, res: Response) {
    try {
      const { id } = req.params
      const limit = Number(req.query.limit)
      const response = await this.service.getSuggest(Number(id), limit)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get suggest account successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async setRolesToAccount(req: Request, res: Response) {
    try {
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
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
