import { GetAccountOutputDTO } from '~/modules/account/dto/Get'

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

export class GetDetailNotificationOutputDTO {
  notificationId!: number
  actor!: GetAccountOutputDTO
  receptor!: GetAccountOutputDTO
  content!: string
  status!: string
  type!: string
  createdAt!: Date
  updatedAt!: Date
  deletedAt?: Date
  constructor(data?: Partial<GetDetailNotificationOutputDTO>) {
    Object.assign(this, data)
  }
}
