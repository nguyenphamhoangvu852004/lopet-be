export class GetListRoleOutputDTO {
  id!: number
  name!: string
  constructor(data?: Partial<GetListRoleOutputDTO>) {
    Object.assign(this, data)
  }
}
