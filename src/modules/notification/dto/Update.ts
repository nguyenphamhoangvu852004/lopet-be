export class UpdateNotificationInputDTO {
  notificationId!: number
  status!: string
  constructor(data?: Partial<UpdateNotificationInputDTO>) {
    Object.assign(this, data)
  }
}
export class UpdateNotificationOutputDTO {
  notificationId!: number
  actorId!: number
  receptorId!: number
  content!: string
  createdAt!: Date
  status!: string
  type!: string
  constructor(data?: Partial<UpdateNotificationOutputDTO>) {
    Object.assign(this, data)
  }
}
