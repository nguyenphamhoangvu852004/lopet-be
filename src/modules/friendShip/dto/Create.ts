export class CreateFriendShipInputDTO {
  senderId!: number
  receiverId!: number
  constructor(data?: Partial<CreateFriendShipInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateFriendShipOutputDTO {
  id!: number
  senderId!: number
  receiverId!: number
  createdAt!: Date
  constructor(data?: Partial<CreateFriendShipOutputDTO>) {
    Object.assign(this, data)
  }
}
