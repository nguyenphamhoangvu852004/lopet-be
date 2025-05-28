import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Notifications } from '~/entities/notifications.entity'
import { INotificationRepo } from '~/modules/notification/repositories/INotificationRepo'

export class NotificationsRepoImpl implements INotificationRepo {
  private notificationRepo: Repository<Notifications>
  constructor() {
    this.notificationRepo = mySqlDataSource.getRepository(Notifications)
  }
  async create(data: Notifications): Promise<Notifications | null> {
    console.log(data)
    const response = await this.notificationRepo.save(data)
    console.log(response)
    if (!response) return null
    return response
  }
  async findById(id: number): Promise<Notifications | null> {
    const response = this.notificationRepo.findOne({
      where: { id: id },
      relations: { actor: true, receptor: true }
    })
    if (!response) return null
    return response
  }
  async findListByAccountId(accountId: number): Promise<Notifications[]> {
    const response = await this.notificationRepo.find({
      where: { receptor: { id: accountId } },
      relations: { actor: true, receptor: true },
      order: { createdAt: 'DESC' }
    })
    if (!response) return []
    return response
  }
}
