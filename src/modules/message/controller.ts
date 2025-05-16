import IMessageService from '~/modules/message/services/IMessageService'
import { Request, Response } from 'express'
import { log } from 'console'
import CreateMessageDTO from '~/modules/message/dto/CreateMessageDTO'

export class MessageController {
  constructor(private service: IMessageService) {
    this.service = service
  }

  async createMessage(req: Request, res: Response) {
    const { senderId, receiverId, content } = req.body
    const dto = new CreateMessageDTO({
      content: content,
      senderId: senderId,
      receiverId: receiverId
    })

    await this.service.createMessage(dto)
    log(req.body)
    res.json({
      message: 'success'
    })
  }
}
