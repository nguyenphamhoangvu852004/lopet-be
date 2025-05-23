export class GetDetailAdvertisementOutputDTO {
  id!: number
  author!: Author
  title!: string
  description!: string
  imageUrl!: string
  linkReferfence!: string
  createdAt!: Date
  updatedAt!: Date
  deletedAt!: Date
  constructor(data?: Partial<GetDetailAdvertisementOutputDTO>) {
    Object.assign(this, data)
  }
}

export class Author {
  id!: number
  username!: string
  email!: string
  constructor(data?: Partial<Author>) {
    Object.assign(this, data)
  }
}
