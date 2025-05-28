import { NOTIFICATION_OBJECT_TYPE, NOTIFICATION_STATUS, Notifications } from '~/entities/notifications.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateNotificationInputDTO, CreateNotificationOutputDTO } from '~/modules/notification/dto/Create'
import { GetNotificationOutputDTO } from '~/modules/notification/dto/Get'
import { INotificationRepo } from '~/modules/notification/repositories/INotificationRepo'
import { INotificationService } from '~/modules/notification/services/INotificationService'
import { handleThrowError } from '~/utils/handle.util'

export class NotificationServiceImpl implements INotificationService {
  constructor(
    private notificationRepo: INotificationRepo,
    private accountRepo: IAccountRepo
  ) {
    this.notificationRepo = notificationRepo
    this.accountRepo = accountRepo
  }
  async getList(accountId: number): Promise<GetNotificationOutputDTO[]> {
    try {
      const notifications = await this.notificationRepo.findListByAccountId(accountId)
      const listNotification: GetNotificationOutputDTO[] = notifications.map((notification) => {
        return new GetNotificationOutputDTO({
          notificationId: notification.id,
          actorId: notification.actor.id,
          receptorId: notification.receptor.id,
          content: notification.content,
          type: notification.objectType,
          status: notification.status,
          createdAt: notification.createdAt
        })
      })
      return listNotification
    } catch (error) {
      handleThrowError(error)
    }
  }
  async create(data: CreateNotificationInputDTO): Promise<CreateNotificationOutputDTO> {
    try {
      const { actorId, receptorId, content, objectType } = data
      const actor = await this.accountRepo.findById(actorId)
      if (!actor) {
        throw new Error(`Actor with ID ${actorId} not found`)
      }
      const receptor = await this.accountRepo.findById(receptorId)
      if (!receptor) {
        throw new Error(`Receptor with ID ${receptorId} not found`)
      }
      const notification = new Notifications({
        actor: actor,
        receptor: receptor,
        content: content,
        status: NOTIFICATION_STATUS.SENT,
        createdAt: new Date()
      })
      if (objectType == 'POST') {
        notification.objectType = NOTIFICATION_OBJECT_TYPE.POST
      }
      if (objectType == 'MESSAGE') {
        notification.objectType = NOTIFICATION_OBJECT_TYPE.MESSAGE
      }

      const createdNotification = await this.notificationRepo.create(notification)
      if (!createdNotification) {
        throw new BadRequest()
      }
      return new CreateNotificationOutputDTO({
        notificationId: createdNotification.id,
        actorId: createdNotification.actor.id,
        receptorId: createdNotification.receptor.id,
        content: createdNotification.content,
        objectType: createdNotification.objectType,
        status: createdNotification.status,
        createdAt: createdNotification.createdAt
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
