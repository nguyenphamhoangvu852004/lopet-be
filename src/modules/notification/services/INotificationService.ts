import { CreateNotificationInputDTO, CreateNotificationOutputDTO } from '~/modules/notification/dto/Create'
import { GetDetailNotificationOutputDTO, GetNotificationOutputDTO } from '~/modules/notification/dto/Get'
import { UpdateNotificationInputDTO, UpdateNotificationOutputDTO } from '~/modules/notification/dto/Update'

export interface INotificationService {
  create(data: CreateNotificationInputDTO): Promise<CreateNotificationOutputDTO>
  getList(accountId: number): Promise<GetNotificationOutputDTO[]>
  getDetail(id: number): Promise<GetDetailNotificationOutputDTO | null>
  updateStatus(data: UpdateNotificationInputDTO): Promise<UpdateNotificationOutputDTO>
}
