import CreateMessageDTO from '~/modules/message/dto/CreateMessageDTO'

export default interface IMessageService {
  createMessage(data: CreateMessageDTO): Promise<void>
}
