import { NOTIFICATION_OBJECT_TYPE, NOTIFICATION_STATUS, Notifications } from '~/entities/notifications.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateNotificationInputDTO, CreateNotificationOutputDTO } from '~/modules/notification/dto/Create'
import { GetDetailNotificationOutputDTO, GetNotificationOutputDTO } from '~/modules/notification/dto/Get'
import { UpdateNotificationInputDTO, UpdateNotificationOutputDTO } from '~/modules/notification/dto/Update'
import { INotificationRepo } from '~/modules/notification/repositories/INotificationRepo'
import { INotificationService } from '~/modules/notification/services/INotificationService'
import { GetProfileOutputDTO } from '~/modules/profile/dto/Get'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'
import { handleThrowError } from '~/utils/handle.util'
export class NotificationServiceImpl implements INotificationService {
  constructor(
    private notificationRepo: INotificationRepo,
    private accountRepo: IAccountRepo,
    private profileRepo: IProfileRepo
  ) {
    this.notificationRepo = notificationRepo
    this.accountRepo = accountRepo
    this.profileRepo = profileRepo
  }
  async getDetail(id: number): Promise<GetDetailNotificationOutputDTO | null> {
    try {
      const noti = await this.notificationRepo.findById(id)
      if (!noti) throw new NotFound()

      const actor = new GetAccountOutputDTO({
        id: noti.actor.id,
        username: noti.actor.username,
        email: noti.actor.email
      })

      const receptor = new GetAccountOutputDTO({
        id: noti.receptor.id,
        username: noti.receptor.username,
        email: noti.receptor.email
      })
      const profileActor = await this.profileRepo.findByAccountId(actor.id)
      if (!profileActor) {
        actor.profile = new GetProfileOutputDTO()
      } else {
        actor.profile = new GetProfileOutputDTO({
          id: profileActor.id,
          fullName: profileActor.fullName,
          phoneNumber: profileActor.phoneNumber,
          bio: profileActor.bio,
          avatarUrl: profileActor.avatarUrl,
          coverUrl: profileActor.coverUrl
        })
      }
      const profileReceptor = await this.profileRepo.findByAccountId(receptor.id)
      if (!profileReceptor) {
        receptor.profile = new GetProfileOutputDTO()
      } else {
        receptor.profile = new GetProfileOutputDTO({
          id: profileReceptor.id,
          fullName: profileReceptor.fullName,
          phoneNumber: profileReceptor.phoneNumber,
          bio: profileReceptor.bio,
          avatarUrl: profileReceptor.avatarUrl,
          coverUrl: profileReceptor.coverUrl
        })
      }
      const dto = new GetDetailNotificationOutputDTO({
        notificationId: noti.id,
        actor: actor,
        receptor: receptor,
        content: noti.content,
        type: noti.objectType,
        status: noti.status,
        createdAt: noti.createdAt,
        updatedAt: noti.updatedAt ?? undefined,
        deletedAt: noti.deletedAt ?? undefined
      })
      return dto
    } catch (error) {
      handleThrowError(error)
    }
  }
  async updateStatus(data: UpdateNotificationInputDTO): Promise<UpdateNotificationOutputDTO> {
    try {
      const { notificationId, status } = data
      const notification = await this.notificationRepo.findById(notificationId)
      if (!notification) {
        throw new BadRequest(`Notification with ID ${notificationId} not found`)
      }
      if (status === NOTIFICATION_STATUS.READ) {
        notification.status = NOTIFICATION_STATUS.READ
      } else if (status === NOTIFICATION_STATUS.DELIVERED) {
        notification.status = NOTIFICATION_STATUS.DELIVERED
      } else if (status === NOTIFICATION_STATUS.SENT) {
        notification.status = NOTIFICATION_STATUS.SENT
      } else {
        throw new BadRequest(`Invalid status: ${status}`)
      }
      const updatedNotification = await this.notificationRepo.create(notification)
      if (!updatedNotification) {
        throw new BadRequest('Failed to update notification status')
      }
      return new UpdateNotificationOutputDTO({
        notificationId: updatedNotification.id,
        actorId: updatedNotification.actor.id,
        receptorId: updatedNotification.receptor.id,
        content: updatedNotification.content,
        type: updatedNotification.objectType,
        status: updatedNotification.status,
        createdAt: updatedNotification.createdAt
      })
    } catch (error) {
      handleThrowError(error)
    }
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
