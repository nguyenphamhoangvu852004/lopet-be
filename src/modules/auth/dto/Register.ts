export class RegisterInputDTO {
  username!: string
  email!: string
  password!: string
  confirmPassword!: string
  constructor(data?: Partial<RegisterInputDTO>) {
    Object.assign(this, data)
  }
}

export class RegisterOutputDTO {
  id!: number
  email!: string
  username!: string
  constructor(data?: Partial<RegisterOutputDTO>) {
    Object.assign(this, data)
  }
}
