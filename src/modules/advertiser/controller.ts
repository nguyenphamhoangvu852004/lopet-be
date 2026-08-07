import { Request, Response } from 'express'
import { ADVERTISERSTATUS } from '~/entities/advertiserProfiles.entity'
import { httpStatusCode } from '~/global/httpStatusCode'
import { ApiResponse, sendResponse } from '~/response/api.response'
import {
  RegisterAdvertiserInputDTO,
  ReviewAdvertiserInputDTO
} from '~/modules/advertiser/dto/AdvertiserProfile'
import IAdvertiserProfileService from '~/modules/advertiser/services/IAdvertiserProfileService'

export class AdvertiserController {
  constructor(private service: IAdvertiserProfileService) {
    this.service = service
  }

  async register(req: Request, res: Response) {
    const { companyName } = req.body
    const response = await this.service.register(
      new RegisterAdvertiserInputDTO({
        // Lấy từ token — không cho client tự khai hộ tài khoản khác
        accountId: Number(req.user.id),
        companyName: companyName
      })
    )
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.CREATED,
        message: 'Đăng ký hồ sơ nhà quảng cáo thành công, chờ duyệt',
        data: response
      })
    )
  }

  async getMine(req: Request, res: Response) {
    const response = await this.service.getMine(Number(req.user.id))
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get advertiser profile successfully',
        data: response
      })
    )
  }

  async getList(req: Request, res: Response) {
    const response = await this.service.getList()
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get list advertiser profile successfully',
        data: response
      })
    )
  }

  async review(req: Request, res: Response) {
    const { id } = req.params
    const { status } = req.body
    const response = await this.service.review(
      new ReviewAdvertiserInputDTO({
        profileId: Number(id),
        status: status as ADVERTISERSTATUS,
        reviewerId: Number(req.user.id)
      })
    )
    sendResponse(
      new ApiResponse({
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Cập nhật trạng thái hồ sơ nhà quảng cáo thành công',
        data: response
      })
    )
  }
}
