import { MESSAGESTATUS } from '~/entities/messages.entity'

export class ChangeStatusMessageInputDTO {
  id: number
  status: MESSAGESTATUS
  constructor(id: number, status: MESSAGESTATUS) {
    this.id = id
    this.status = status
  }
}

export class ChangeStatusMessageOutputDTO {
  success: boolean
  message: string
  constructor(success: boolean, message: string) {
    this.success = success
    this.message = message
  }
}
