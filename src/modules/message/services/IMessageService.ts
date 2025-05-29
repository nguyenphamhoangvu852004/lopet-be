import { CreateMessageInputDTO, CreateMessageOutputDTO } from '~/modules/message/dto/CreateMessageDTO'
import { GetListMessageInputDTO, GetMessageOutputDTO } from '~/modules/message/dto/Get'
import { ChangeStatusMessageInputDTO, ChangeStatusMessageOutputDTO } from '~/modules/message/dto/Update'

export default interface IMessageService {
  createMessage(data: CreateMessageInputDTO): Promise<CreateMessageOutputDTO>
  changeStatus(data: ChangeStatusMessageInputDTO): Promise<ChangeStatusMessageOutputDTO>
  getListMessage(data: GetListMessageInputDTO): Promise<GetMessageOutputDTO[]>
  getDetail(data: number): Promise<GetMessageOutputDTO>
}
