import { Notifications } from '~/entities/notifications.entity'

export interface INotificationRepo {
  create(data: Notifications): Promise<Notifications | null>
  findById(id: number): Promise<Notifications | null>
  findListByAccountId(accountId: number): Promise<Notifications[]>
}
