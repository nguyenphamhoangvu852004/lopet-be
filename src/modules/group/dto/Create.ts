import { GROUPTYPE } from '~/entities/groups.entity'

export class CreateGroupInputDTO {
  name!: string
  type!: GROUPTYPE
  owner!: number
  constructor(data?: Partial<CreateGroupInputDTO>) {
    Object.assign(this, data)
  }
}

export class CreateGroupOutputDTO {
  id!: number
  name!: string
  type!: GROUPTYPE
  owner!: number
  createdAt!: Date
  constructor(data?: Partial<CreateGroupOutputDTO>) {
    Object.assign(this, data)
  }
}
