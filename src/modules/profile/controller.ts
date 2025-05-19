import IProfileService from '~/modules/profile/services/IProfileService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import { IAccountService } from '~/modules/account/services/IAccountService'
import { CreateProfileInputDTO, CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { BadRequest } from '~/error/error.custom'
import cloudinary from '~/config/cloudinary'
import { UpdateProfileInputDTO } from '~/modules/profile/dto/Update'
import { logger } from '~/config/logger'

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
      const files = req.files as {
        avatar?: Express.Multer.File[]
        cover?: Express.Multer.File[]
      }
      let avatarUrl = ''
      let coverUrl = ''
      // up cái avatarr lên nếu có
      if (files.avatar) {
        const rs = await cloudinary.uploader.upload(files.avatar[0].path)
        console.log(rs)
        avatarUrl = rs.secure_url
      }

      // up cái ảnh bìa lên nếu có
      if (files.cover) {
        const rs = await cloudinary.uploader.upload(files.cover[0].path)
        console.log(rs)
        coverUrl = rs.secure_url
      }
      const profile: CreateProfileOutputDTO = await this.profileService.create(
        new CreateProfileInputDTO({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          avatarUrl: avatarUrl,
          coverUrl: coverUrl
        })
      )
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
      const { id } = req.params
      const data = req.body
      const files = req.files as {
        avatar?: Express.Multer.File[]
        cover?: Express.Multer.File[]
      }
      let avatarUrl = ''
      let coverUrl = ''

      // up cái avatarr lên nếu có
      if (files.avatar) {
        const rs = await cloudinary.uploader.upload(files.avatar[0].path)
        console.log(rs)
        avatarUrl = rs.secure_url
      }

      // up cái ảnh bìa lên nếu có
      if (files.cover) {
        const rs = await cloudinary.uploader.upload(files.cover[0].path)
        console.log(rs)
        coverUrl = rs.secure_url
      }

      const response = await this.profileService.update(
        new UpdateProfileInputDTO({
          id: Number(id),
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          avatarUrl: avatarUrl,
          coverUrl: coverUrl
        })
      )
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Update profile successfully'
        })
      )
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
