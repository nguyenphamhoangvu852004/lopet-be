export class ResetPasswordInputDto {
  email!: string
  password!: string
  confirmPassword!: string
  constructor(data?: Partial<ResetPasswordInputDto>) {
    Object.assign(this, data)
  }
}

export class ResetPasswordOutputDto {
  id!: number
  email!: string
  username!: string
  constructor(data?: Partial<ResetPasswordOutputDto>) {
    Object.assign(this, data)
  }
}
