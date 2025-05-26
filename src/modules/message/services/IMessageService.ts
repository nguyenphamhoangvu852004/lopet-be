import { CreateMessageInputDTO, CreateMessageOutputDTO } from '~/modules/message/dto/CreateMessageDTO'
import { GetMessageOutputDTO } from '~/modules/message/dto/Get'
import { ChangeStatusMessageInputDTO, ChangeStatusMessageOutputDTO } from '~/modules/message/dto/Update'

export default interface IMessageService {
  createMessage(data: CreateMessageInputDTO): Promise<CreateMessageOutputDTO>
  changeStatus(data: ChangeStatusMessageInputDTO): Promise<ChangeStatusMessageOutputDTO>
  getDetail(data: number): Promise<GetMessageOutputDTO>
}
