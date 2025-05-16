export class LoginInputDTO {
  username!: string
  password!: string
  constructor(data?: Partial<LoginInputDTO>) {
    Object.assign(this, data)
  }
}

export class LoginOutputDTO {
  id!: number
  accessToken!: string
  refreshToken!: string
  constructor(data?: Partial<LoginOutputDTO>) {
    Object.assign(this, data)
  }
}
