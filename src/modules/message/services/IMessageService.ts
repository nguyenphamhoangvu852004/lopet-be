import CreateMessageDTO from '~/modules/message/dto/createMessageDTO'

export default interface IMessageService {
  createMessage(data: CreateMessageDTO): Promise<void>
}
