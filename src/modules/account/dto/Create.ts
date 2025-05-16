export class CreateAccountDTO {
  email!: string
  username!: string
  password!: string
  constructor(data?: Partial<CreateAccountDTO>) {
    Object.assign(this, data)
  }
}
