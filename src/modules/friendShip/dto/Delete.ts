export class DeleteFriendShipInputDTO {
  senderId!: number
  receiverId!: number
  constructor(data?: Partial<DeleteFriendShipInputDTO>) {
    Object.assign(this, data)
  }
}

export class DeleteFriendShipOutputDTO {
  senderId!: number
  receiverId!: number
  isSuccess!: boolean
  constructor(data?: Partial<DeleteFriendShipOutputDTO>) {
    Object.assign(this, data)
  }
}
