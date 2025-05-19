export class RemoveMemberInputDTO {
  groupId!: number
  owner!: number
  member!: number
  constructor(data?: Partial<RemoveMemberInputDTO>) {
    Object.assign(this, data)
  }
}

export class RemoveMemberOutputDTO {
  groupId!: number
  member!: number
  constructor(data?: Partial<RemoveMemberOutputDTO>) {
    Object.assign(this, data)
  }
}
