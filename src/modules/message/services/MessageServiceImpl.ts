import { Messages, MESSAGESTATUS } from '~/entities/messages.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateMessageInputDTO, CreateMessageOutputDTO } from '~/modules/message/dto/CreateMessageDTO'
import { GetListMessageInputDTO, GetMessageOutputDTO } from '~/modules/message/dto/Get'
import { ChangeStatusMessageInputDTO, ChangeStatusMessageOutputDTO } from '~/modules/message/dto/Update'
import { IMessageRepo } from '~/modules/message/repositories/IMessageRepo'
import IMessageService from '~/modules/message/services/IMessageService'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'
import { handleThrowError } from '~/utils/handle.util'

export default class MessageServiceImpl implements IMessageService {
  constructor(
    private messageRepo: IMessageRepo,
    private accountRepo: IAccountRepo,
    private profileRepo: IProfileRepo
  ) {
    this.messageRepo = messageRepo
    this.accountRepo = accountRepo
    this.profileRepo = profileRepo
  }
  async getListMessage(data: GetListMessageInputDTO): Promise<GetMessageOutputDTO[]> {
    try {
      const sender = await this.accountRepo.findById(data.senderId)
      if (!sender) throw new Error('Sender not found')
      const receiver = await this.accountRepo.findById(data.receiverId)
      if (!receiver) throw new Error('Receiver not found')

      const response = await this.messageRepo.getListMessage(data.senderId, data.receiverId)
      const listdto: GetMessageOutputDTO[] = []

      for (const message of response) {
        const dto = new GetMessageOutputDTO({
          id: message.id,
          content: message.content,
          mediaUrl: message.mediaUrl,
          senderId: message.sender.id,
          receiverId: message.receiver.id,
          createdAt: message.createdAt,
          status: message.status
        })
        listdto.push(dto)
      }
      return listdto
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getDetail(data: number): Promise<GetMessageOutputDTO> {
    try {
      const response = await this.messageRepo.findById(data)
      if (!response) throw new Error('Message not found')
      return new GetMessageOutputDTO({
        id: response.id,
        content: response.content,
        senderId: response.sender.id,
        receiverId: response.receiver.id,
        mediaUrl: response.mediaUrl,
        createdAt: response.createdAt,
        status: response.status
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
  async changeStatus(data: ChangeStatusMessageInputDTO): Promise<ChangeStatusMessageOutputDTO> {
    try {
      const message = await this.messageRepo.findById(data.id)
      if (!message) throw new Error('Message not found')
      message.status = data.status
      const response = await this.messageRepo.changeStatus(message)
      if (!response) throw new Error('Update message failed')
      const dto = new ChangeStatusMessageOutputDTO(true, 'Update message successfully')
      return dto
    } catch (error) {
      handleThrowError(error)
    }
  }
  async createMessage(data: CreateMessageInputDTO): Promise<CreateMessageOutputDTO> {
    try {
      const sender = await this.accountRepo.findById(Number(data.senderId))
      if (!sender) throw new NotFound('Sender not found')
      const receiver = await this.accountRepo.findById(Number(data.receiverId))
      if (!receiver) throw new NotFound('Receiver not found')
      const messageEntity = new Messages({
        content: data.content,
        sender: sender,
        receiver: receiver,
        mediaUrl: data.imageUrl ?? '',
        status: MESSAGESTATUS.SENT
      })
      const response = await this.messageRepo.create(messageEntity)
      if (!response) throw new BadRequest('Create message failed')
      const dto = new CreateMessageInputDTO({
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        imageUrl: data.imageUrl
      })
      return dto
    } catch (error) {
      handleThrowError(error)
    }
  }
}
