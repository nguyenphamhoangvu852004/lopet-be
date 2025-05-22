export class GetFriendShipOutputDTO {
  me!: Sender
  others!: Receiver[]
  constructor(data?: Partial<GetFriendShipOutputDTO>) {
    Object.assign(this, data)
  }
}
export class Sender {
  id!: number
  username!: string
  email!: string
  status!: string
  constructor(data?: Partial<Sender>) {
    Object.assign(this, data)
  }
}

export class Receiver {
  id!: number
  username!: string
  email!: string
  imageUrl!: string
  status!: string
  constructor(data?: Partial<Receiver>) {
    Object.assign(this, data)
  }
}
