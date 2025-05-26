import IMessageService from '~/modules/message/services/IMessageService'
import { Request, Response } from 'express'
import { log } from 'console'
import { CreateMessageInputDTO } from '~/modules/message/dto/CreateMessageDTO'
import { handleControllerError } from '~/utils/handle.util'
import cloudinary from '~/config/cloudinary'
import { ChangeStatusMessageInputDTO } from '~/modules/message/dto/Update'
import { MESSAGESTATUS } from '~/entities/messages.entity'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'

export class MessageController {
  constructor(private service: IMessageService) {
    this.service = service
  }
  async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params
      const response = await this.service.getDetail(Number(id))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get detail message successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      const inputDTO = new ChangeStatusMessageInputDTO(Number(id), status as MESSAGESTATUS)
      const response = await this.service.changeStatus(inputDTO)
      sendResponse(
        new ApiResponse({
          res: res,
          data: response,
          statusCode: httpStatusCode.OK,
          message: 'Update message successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async createMessage(req: Request, res: Response) {
    try {
      log('sdlkfjasldk;fj')
      log(req.body)
      const image = req.file
      let uploadedImage
      if (image) {
        uploadedImage = await cloudinary.uploader.upload(image.path)
      }
      const dto = new CreateMessageInputDTO({
        content: req.body.content ?? '',
        senderId: req.body.senderId,
        receiverId: req.body.receiverId,
        imageUrl: uploadedImage.secure_url ?? ''
      })

      const response = await this.service.createMessage(dto)
      res.status(201).json({
        status: 'success',
        message: 'Message created successfully',
        data: response
      })
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
