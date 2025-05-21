export class BanIdOutputDTO {
  id!: number
  constructor(data?: Partial<BanIdOutputDTO>) {
    Object.assign(this, data)
  }
}
