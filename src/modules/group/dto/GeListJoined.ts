export class GetListJoinedInputDTO {
  constructor(data?: Partial<GetListJoinedInputDTO>) {
    Object.assign(this, data)
  }
}

export class GetListJoinedOutputDTO {
  id!: number
  name!: string
  ownerId!: number
  bio!: string
  coverUrl!: string
  type!: string
  totalMembers!: number
  createdAt!: Date
  constructor(data?: Partial<GetListJoinedOutputDTO>) {
    Object.assign(this, data)
  }
}
