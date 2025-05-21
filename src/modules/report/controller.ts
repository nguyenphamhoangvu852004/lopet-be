import { IReportService } from '~/modules/report/services/IReportService'
import { handleControllerError } from '~/utils/handle.util'
import { Request, Response } from 'express'
import { CreateReportInputDTO } from '~/modules/report/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
export class ReportController {
  constructor(private reportSerice: IReportService) {
    this.reportSerice = reportSerice
  }
  async create(req: Request, res: Response) {
    try {
      const { accountId, targetId, type, reason } = req.body
      const dto = new CreateReportInputDTO({
        accountId: accountId,
        targetId: targetId,
        type: type,
        reason: reason
      })
      const response = await this.reportSerice.create(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          statusCode: httpStatusCode.CREATED,
          message: httpStatusMessage.CREATED
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
