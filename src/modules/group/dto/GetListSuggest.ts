export class GetListSuggestGroupInputDTO {
  constructor(data?: Partial<GetListSuggestGroupInputDTO>) {
    Object.assign(this, data)
  }
}

export class GetListSuggestGroupOutputDTO {
  id!: number
  name!: string
  ownerId!: number
  bio!: string
  coverUrl!: string
  type!: string
  totalMembers!: number
  createdAt!: Date
  constructor(data?: Partial<GetListSuggestGroupOutputDTO>) {
    Object.assign(this, data)
  }
}
