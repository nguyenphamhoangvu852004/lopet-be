export class GetListOwnedInputDTO {
  constructor(data?: Partial<GetListOwnedInputDTO>) {
    Object.assign(this, data)
  }
}

export class GetListOwnedOutputDTO {
  id!: number
  name!: string
  ownerId!: number
  bio!: string
  coverUrl!: string
  type!: string
  totalMembers!: number
  createdAt!: Date
  constructor(data?: Partial<GetListOwnedOutputDTO>) {
    Object.assign(this, data)
  }
}
