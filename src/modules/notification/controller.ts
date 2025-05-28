import { INotificationService } from '~/modules/notification/services/INotificationService'
import { handleControllerError } from '~/utils/handle.util'
import { Request, Response } from 'express'
import { CreateNotificationInputDTO } from '~/modules/notification/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { UpdateNotificationInputDTO } from '~/modules/notification/dto/Update'

export class NotificationController {
  constructor(private notificationService: INotificationService) {
    this.notificationService = notificationService
  }
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params
      console.log('id', id)
      const notification = await this.notificationService.getDetail(Number(id))
      sendResponse(
        new ApiResponse({
          data: notification,
          res: res,
          statusCode: 200,
          message: 'Get notification detail successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async create(req: Request, res: Response) {
    try {
      const { actorId, receptorId, content, objectType } = req.body
      const dto = new CreateNotificationInputDTO({
        actorId: Number(actorId),
        receptorId: Number(receptorId),
        content: content,
        objectType: objectType
      })
      const response = await this.notificationService.create(dto)

      res.io.to(`user_${response.receptorId}`).emit('notification', {
        actorId: response.actorId,
        receptorId: response.receptorId,
        content: response.content,
        objectType: response.objectType,
        status: response.status,
        createdAt: response.createdAt
      })

      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: 201,
          message: 'Create notification successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  async getList(req: Request, res: Response) {
    try {
      const { id } = req.params
      const notifications = await this.notificationService.getList(Number(id))
      sendResponse(
        new ApiResponse({
          data: notifications,
          res: res,
          statusCode: 200,
          message: 'Get list notification successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      const response = await this.notificationService.updateStatus(
        new UpdateNotificationInputDTO({
          notificationId: Number(id),
          status: status
        })
      )
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: 200,
          message: 'Update notification status successfully'
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
