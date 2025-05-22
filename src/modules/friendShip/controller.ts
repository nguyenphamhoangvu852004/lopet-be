import { IFriendShipService } from '~/modules/friendShip/services/IFriendShipService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { CreateFriendShipInputDTO } from '~/modules/friendShip/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode, httpStatusMessage } from '~/global/httpStatusCode'
import { FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { ChangeStatusFriendShipInputDTO } from '~/modules/friendShip/dto/ChangeStatusFriend'
import { DeleteFriendShipInputDTO } from '~/modules/friendShip/dto/Delete'
export class FriendShipController {
  constructor(private service: IFriendShipService) {
    this.service = service
  }
  async getListFriendShipsOfAccount(req: Request, res: Response) {
    try {
      const { id } = req.params
      const resposne = await this.service.getListFriendShipsOfAccount(Number(id))
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: httpStatusMessage.OK,
          data: resposne
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async getListSendFriendShips(req: Request, res: Response) {
    try {
      const { id } = req.params
      const response = await this.service.getListSendFriendShips(Number(id))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get list send friend ship successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  /**
   * @body
   *    - `senderId` (number): Id người gữi lời mời kết bạn
   *    - `receiverId` (number): Id người nhận lời mời kết bạn
   *   */
  async create(req: Request, res: Response) {
    try {
      const { senderId, receiverId } = req.body

      const dto = new CreateFriendShipInputDTO({
        senderId: senderId,
        receiverId: receiverId
      })

      const response = await this.service.create(dto)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Create friend ship successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  /**
   * @body
   *    - `senderId` (number): Id người gữi lời mời kết bạn
   *    - `receiverId` (number): Id người nhận lời mời kết bạn
   *   */
  async accept(req: Request, res: Response) {
    try {
      const { senderId, receiverId } = req.body
      const dto = new ChangeStatusFriendShipInputDTO({
        receiverId: receiverId,
        senderId: senderId,
        status: FRIENDSHIPSTATUS.ACCEPTED
      })
      const response = await this.service.changeStatus(dto)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Accept friend ship successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  /**
   * @body
   *    - `senderId` (number): Id người gữi lời mời kết bạn
   *    - `receiverId` (number): Id người nhận lời mời kết bạn
   *   */
  async reject(req: Request, res: Response) {
    try {
      const { senderId, receiverId } = req.body
      const dto = new ChangeStatusFriendShipInputDTO({
        receiverId: receiverId,
        senderId: senderId,
        status: FRIENDSHIPSTATUS.REJECTED
      })
      const response = await this.service.changeStatus(dto)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Reject friend ship successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const { senderId, receiverId } = req.body
      const response = await this.service.delete(
        new DeleteFriendShipInputDTO({
          receiverId: receiverId,
          senderId: senderId
        })
      )
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Delete friend ship successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }
}
