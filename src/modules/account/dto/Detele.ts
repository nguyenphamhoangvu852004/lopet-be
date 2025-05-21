export class DeleteAccountOutputDTO {
  id!: number
  constructor(data?: Partial<DeleteAccountOutputDTO>) {
    Object.assign(this, data)
  }
}
