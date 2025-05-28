
export class CreateNotificationInputDTO {
  actorId!: number
  receptorId!: number
  content!: string
  objectType!: string

  constructor(data?: Partial<CreateNotificationInputDTO>) {
    Object.assign(this, data)
  }
}
export class CreateNotificationOutputDTO {
  notificationId!: number
  actorId!: number
  receptorId!: number
  content!: string
  objectType!: string
  status!: string
  createdAt!: Date

  constructor(data?: Partial<CreateNotificationOutputDTO>) {
    Object.assign(this, data)
  }
}
