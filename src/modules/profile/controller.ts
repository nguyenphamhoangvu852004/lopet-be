import IProfileService from '~/modules/profile/services/IProfileService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import { UpdateProfileInputDTO, UpdateProfileOutputDTO } from '~/modules/profile/dto/Update'
import { IAccountService } from '~/modules/account/services/IAccountService'
import { CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { BadRequest } from '~/error/error.custom'

export class ProfileController {
  constructor(
    private profileService: IProfileService,
    private accountService: IAccountService
  ) {
    this.profileService = profileService
    this.accountService = accountService
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id
      const profile = await this.profileService.findById(Number(id))
      sendResponse(
        new ApiResponse({ data: profile, res: res, statusCode: httpStatusCode.OK, message: 'Get profile successfully' })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }

  async getByAccountId(req: Request, res: Response) {
    try {
      const id = req.params.id
      const profile = await this.profileService.findByAccountId(Number(id))
      sendResponse(
        new ApiResponse({ data: profile, res: res, statusCode: httpStatusCode.OK, message: 'Get profile successfully' })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const profile: CreateProfileOutputDTO = await this.profileService.create(data)
      if (!profile) throw new BadRequest()
      sendResponse(
        new ApiResponse({
          data: profile,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Create profile successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = req.body
      const id = req.params.id
      const profile: UpdateProfileOutputDTO = await this.profileService.update(
        new UpdateProfileInputDTO({
          id: Number(id),
          ...data
        })
      )
      sendResponse(
        new ApiResponse({
          data: profile,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Update profile successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async setToAccount(req: Request, res: Response) {
    try {
      const { accountId } = req.body
      const { id } = req.params
      const profile = await this.profileService.setToAccount(Number(id), accountId)
      sendResponse(
        new ApiResponse({
          data: profile,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Set profile to account successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
