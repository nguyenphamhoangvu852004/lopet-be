export class GetFriendShipOutputDTO {
  me!: Sender
  others!: Receiver[]
  constructor(data?: Partial<GetFriendShipOutputDTO>) {
    Object.assign(this, data)
  }
}
/**
 * `me` là tài khoản ĐANG ĐƯỢC XEM (theo :id), không phải người gọi — nên cũng
 * không trả email ra ngoài.
 */
export class Sender {
  id!: number
  username!: string
  imageUrl!: string
  status!: string
  constructor(data?: Partial<Sender>) {
    Object.assign(this, data)
  }
}

/**
 * Không có trường email: DTO này liệt kê nhiều tài khoản một lúc, để email ở
 * đây là rò email hàng loạt cho bất kỳ ai gọi được endpoint.
 */
export class Receiver {
  id!: number
  username!: string
  imageUrl!: string
  status!: string
  constructor(data?: Partial<Receiver>) {
    Object.assign(this, data)
  }
}
