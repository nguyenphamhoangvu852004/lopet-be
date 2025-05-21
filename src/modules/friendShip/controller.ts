import { IFriendShipService } from '~/modules/friendShip/services/IFriendShipService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { CreateFriendShipInputDTO } from '~/modules/friendShip/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
export class FriendShipController {
  constructor(private service: IFriendShipService) {
    this.service = service
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
}
