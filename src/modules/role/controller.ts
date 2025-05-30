import { handleControllerError } from '~/utils/handle.util'
import { Request, Response } from 'express'
import IRoleService from './service/IRoleService'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'

export default class RoleController {
  roleService: IRoleService
  constructor(roleService: IRoleService) {
    this.roleService = roleService
  }

  async getList(req: Request, res: Response) {
    try {
      const response = await this.roleService.getList()
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get list role successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async createRoles() {
    await this.roleService.createRoles()
  }
}
