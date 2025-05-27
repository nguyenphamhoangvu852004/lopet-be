export class UpdateAdvertsementInputDTO {
  accountId!: number
  adsId!: number
  title!: string
  description!: string
  imageurl!: string
  linkref!: string
  constructor(data?: Partial<UpdateAdvertsementInputDTO>) {
    Object.assign(this, data)
  }
}

export class UpdateAdvertsementOutputDTO {
  id!: number
  constructor(data?: Partial<UpdateAdvertsementOutputDTO>) {
    Object.assign(this, data)
  }
}
