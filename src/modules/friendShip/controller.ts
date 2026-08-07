import { IFriendShipService } from '~/modules/friendShip/services/IFriendShipService'
import { Request, Response } from 'express'

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
  async getListReceiveFriendShips(req: Request, res: Response) {
    const response = await this.service.getListReceiveFriendShips(
      Number(req.user.id)
    )
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get list send friend ship successfully'
      })
    )
  }
  async getListSendFriendShips(req: Request, res: Response) {
    const response = await this.service.getListSendFriendShips(
      Number(req.user.id)
    )
    sendResponse(
      new ApiResponse({
        data: response,
        res: res,
        statusCode: httpStatusCode.OK,
        message: 'Get list send friend ship successfully'
      })
    )
  }

  async getListFriendShipsOfAccount(req: Request, res: Response) {
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
  }
  /**
   * @body
   *    - `receiverId` (number): Id người nhận lời mời kết bạn
   *
   * Id người gữi lời mời kết bạn được lấy từ token (req.user.id)
   *   */
  async create(req: Request, res: Response) {
    const { receiverId } = req.body

    const dto = new CreateFriendShipInputDTO({
      senderId: req.user.id,
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
  }

  /**
   * @body
   *    - `senderId` (number): Id người gữi lời mời kết bạn
   *
   * Id người nhận lời mời kết bạn được lấy từ token (req.user.id)
   *   */
  async accept(req: Request, res: Response) {
    const { senderId } = req.body
    const dto = new ChangeStatusFriendShipInputDTO({
      receiverId: req.user.id,
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
  }

  /**
   * @body
   *    - `senderId` (number): Id người gữi lời mời kết bạn
   *
   * Id người nhận lời mời kết bạn được lấy từ token (req.user.id)
   *   */
  async reject(req: Request, res: Response) {
    const { senderId } = req.body
    const dto = new ChangeStatusFriendShipInputDTO({
      receiverId: req.user.id,
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
  }
  /**
   * Huỷ kết bạn. Trước đây nhận CẢ senderId lẫn receiverId từ body và không
   * đối chiếu người gọi, nên bất kỳ ai đăng nhập cũng huỷ được quan hệ bạn bè
   * giữa hai người xa lạ. Giờ một đầu luôn là chính người gọi.
   *
   * Service đã dò quan hệ theo cả hai chiều nên không cần biết ai là người
   * gửi lời mời ban đầu.
   */
  async delete(req: Request, res: Response) {
    const { friendId } = req.body
    const response = await this.service.delete(
      new DeleteFriendShipInputDTO({
        senderId: Number(req.user.id),
        receiverId: Number(friendId)
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
  }
}
