export class VerifyAccountInputDTO {
  email!: string
  password!: string
  constructor(data?: Partial<VerifyAccountInputDTO>) {
    Object.assign(this, data)
  }
}

export class VerifyAccountOutputDTO {
  isValid!: boolean
  constructor(data?: Partial<VerifyAccountOutputDTO>) {
    Object.assign(this, data)
  }
}
