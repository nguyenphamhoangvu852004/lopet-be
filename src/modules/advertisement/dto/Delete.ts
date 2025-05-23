export class DeleteAdvertsementOutputDTO {
  message!: string
  constructor(data?: Partial<DeleteAdvertsementOutputDTO>) {
    Object.assign(this, data)
  }
}
