export class FindAccountInputDTO {
  email!: string
  username!: string
  constructor(data?: Partial<FindAccountInputDTO>) {
    Object.assign(this, data)
  }
}
