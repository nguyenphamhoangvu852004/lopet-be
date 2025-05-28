import { CreateNotificationInputDTO, CreateNotificationOutputDTO } from '~/modules/notification/dto/Create'
import { GetNotificationOutputDTO } from '~/modules/notification/dto/Get'

export interface INotificationService {
  create(data: CreateNotificationInputDTO): Promise<CreateNotificationOutputDTO>
  getList(accountId: number): Promise<GetNotificationOutputDTO[]>
}
