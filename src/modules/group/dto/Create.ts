import { GROUPTYPE } from '~/entities/groups.entity'

export class CreateGroupInputDTO {
  name!: string
  type!: GROUPTYPE
  owner!: number
  bio?: string
  coverUrl?: string

  constructor(data?: Partial<CreateGroupInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateGroupOutputDTO {
  id!: number
  name!: string
  type!: GROUPTYPE
  owner!: number
  bio?: string
  coverUrl?: string
  createdAt!: Date
  constructor(data?: Partial<CreateGroupOutputDTO>) {
    Object.assign(this, data)
  }
}
