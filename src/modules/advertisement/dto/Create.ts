export class CreateAdvertsementInputDTO {
  accountId!: number
  title!: string
  description!: string
  imageurl!: string
  linkref!: string
  constructor(data?: Partial<CreateAdvertsementInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateAdvertsementOutputDTO {
  id!: number
  constructor(data?: Partial<CreateAdvertsementOutputDTO>) {
    Object.assign(this, data)
  }
}
