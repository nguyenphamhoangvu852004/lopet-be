import { Messages } from '~/entities/messages.entity'

export interface IMessageRepo {
  create(data: Messages): Promise<Messages | null>
  findById(data: number): Promise<Messages | null>
  changeStatus(data: Messages): Promise<Messages | null>
  getListMessage(senderId: number, receiverId: number): Promise<Messages[]>

}
