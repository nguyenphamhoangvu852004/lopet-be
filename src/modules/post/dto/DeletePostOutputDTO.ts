export class DeletePostOutputDTO {
  id!: number
  constructor(data: Partial<DeletePostOutputDTO>) {
    Object.assign(this, data)
  }
}
