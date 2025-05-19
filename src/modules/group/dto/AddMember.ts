export class AddMemberInputDTO {
  groupId!: number
  owner!: number
  invitee!: number
  constructor(data?: Partial<AddMemberInputDTO>) {
    Object.assign(this, data)
  }
}

export class AddMemberOutputDTO {
  groupId!: number
  invitee!: number
  constructor(data?: Partial<AddMemberOutputDTO>) {
    Object.assign(this, data)
  }
}
