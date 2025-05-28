export class GetNotificationOutputDTO {
  notificationId!: number
  actorId!: number
  receptorId!: number
  content!: string
  createdAt!: Date
  status!: string
  type!: string
  constructor(data?: Partial<GetNotificationOutputDTO>) {
    Object.assign(this, data)
  }
}
