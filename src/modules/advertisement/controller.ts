import { IAdvertisementService } from '~/modules/advertisement/services/IAdvertisementService'
import { Request, Response } from 'express'
import { httpStatusCode } from '~/global/httpStatusCode'
import { sendResponse, ApiResponse } from '~/response/api.response'
import { handleControllerError } from '~/utils/handle.util'
import { CreateAdvertsementInputDTO } from '~/modules/advertisement/dto/Create'
import cloudinary from '~/config/cloudinary'
import { UpdateAdvertsementInputDTO } from '~/modules/advertisement/dto/Update'

export class AdvertisementController {
  constructor(private advertisementService: IAdvertisementService) {
    this.advertisementService = advertisementService
  }
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params
      const response = await this.advertisementService.getDetail(Number(id))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get detail advertisement successfully'
        })
      )
    } catch (err) {
      handleControllerError(err, res)
    }
  }
  async getList(req: Request, res: Response) {
    try {
      const accountId = req.query.accountId ? Number(req.query.accountId) : undefined
      const response = await this.advertisementService.getList(accountId)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get list advertisement successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async create(req: Request, res: Response) {
    try {
      const { accountId, title, description, linkRef } = req.body
      const image = req.file as Express.Multer.File

      const rs = await cloudinary.uploader.upload(image.path, { resource_type: 'image' })

      const dto = new CreateAdvertsementInputDTO({
        accountId: accountId,
        description: description,
        title: title,
        linkref: linkRef,
        imageurl: rs.secure_url
      })

      const repsonse = await this.advertisementService.create(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Create advertisement successfully',
          data: repsonse
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const response = await this.advertisementService.delet(Number(id))
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Delete advertisement successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async update(req: Request, res: Response) {
    try {
      const { accountId, title, description, linkRef } = req.body
      const { adsId } = req.params
      const image = req.file as Express.Multer.File

      const rs = await cloudinary.uploader.upload(image.path, { resource_type: 'image' })

      const dto = new UpdateAdvertsementInputDTO({
        adsId: Number(adsId),
        accountId: accountId,
        description: description,
        title: title,
        linkref: linkRef,
        imageurl: rs.secure_url
      })
      const response = await this.advertisementService.update(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Update advertisement successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
