/* eslint-disable @typescript-eslint/no-explicit-any */
import { IReportService } from '~/modules/report/services/IReportService'

import { Request, Response } from 'express'
import { CreateReportInputDTO } from '~/modules/report/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'
import { ChangeStatusReportInputDTO } from '~/modules/report/dto/ChangeStatusReportDTO'
export class ReportController {
  constructor(private reportSerice: IReportService) {
    this.reportSerice = reportSerice
  }
  async create(req: Request, res: Response) {
    const { targetId, type, reason } = req.body
    const dto = new CreateReportInputDTO({
      accountId: req.user.id,
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
        message: response?.message ?? httpStatusMessage.CREATED
      })
    )
  }
  async getList(req: Request, res: Response) {
    // Không ép `as any`: query string luôn là string | undefined, khai đúng kiểu
    // để chỗ này không âm thầm nhận nhầm mảng hay object lồng nhau từ client
    const { type, accountId, targetId } = req.query as {
      type?: string
      accountId?: string
      targetId?: string
    }

    const dto = new GetListReportInputDTO({
      accountId: accountId ? Number(accountId) : undefined,
      type: type,
      targetId: targetId ? Number(targetId) : undefined
    })

    const response = await this.reportSerice.getList(dto)
    sendResponse(
      new ApiResponse({
        res: res,
        data: response,
        statusCode: httpStatusCode.OK,
        message: 'Get list report successfully'
      })
    )
  }
  async update(req: Request, res: Response) {
    const { targetId } = req.params
    const { type, action } = req.body
    console.log(
      'Update report with targetId:',
      targetId,
      'type:',
      type,
      'action:',
      action
    )
    const dto = new ChangeStatusReportInputDTO({
      targetId: Number(targetId),
      type: type,
      action: action,
      resolvedBy: Number(req.user.id)
    })
    const response = await this.reportSerice.update(dto)
    sendResponse(
      new ApiResponse({
        res: res,
        data: response,
        statusCode: httpStatusCode.OK,
        message: 'Update report successfully'
      })
    )
  }
}
