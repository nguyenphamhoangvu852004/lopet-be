import { FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'

export class ChangeStatusFriendShipInputDTO {
  senderId!: number
  receiverId!: number
  status!: FRIENDSHIPSTATUS
  constructor(data?: Partial<ChangeStatusFriendShipInputDTO>) {
    Object.assign(this, data)
  }
}

export class ChangeStatusFriendShipOutputDTO {
  senderId!: number
  receiverId!: number
  status!: string
  constructor(data?: Partial<ChangeStatusFriendShipOutputDTO>) {
    Object.assign(this, data)
  }
}
