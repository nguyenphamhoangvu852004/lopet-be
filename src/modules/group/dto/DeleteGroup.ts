export class DeleteGroupInputDTO {
  groupId!: number
  owner!: number
  constructor(data?: Partial<DeleteGroupInputDTO>) {
    Object.assign(this, data)
  }
}

export class DeleteGroupOutputDTO {
  groupId!: number
  owner!: number
  constructor(data?: Partial<DeleteGroupOutputDTO>) {
    Object.assign(this, data)
  }
}
