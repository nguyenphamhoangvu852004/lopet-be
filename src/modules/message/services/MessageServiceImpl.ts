import { log } from 'console'
import CreateMessageDTO from '~/modules/message/dto/CreateMessageDTO'
import IMessageService from '~/modules/message/services/IMessageService'

export default class MessageServiceImpl implements IMessageService {
  createMessage(data: CreateMessageDTO): Promise<void> {
    log(data)
    throw new Error('Method not implemented.')
  }
}
