import { Router } from 'express'
import { MessageController } from '~/modules/message/controller'
import MessageServiceImpl from '~/modules/message/services/MessageServiceImpl'

export const messageRouter = Router()

const service = new MessageServiceImpl()
const controller = new MessageController(service)
messageRouter.post('/', controller.createMessage.bind(controller))
