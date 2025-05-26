import { relative } from 'path'
import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Messages } from '~/entities/messages.entity'
import { IMessageRepo } from '~/modules/message/repositories/IMessageRepo'

export class MessageRepoImpl implements IMessageRepo {
  private messageRepo: Repository<Messages>
  constructor() {
    this.messageRepo = mySqlDataSource.getRepository(Messages)
  }
  async getListMessage(senderId: number, receiverId: number): Promise<Messages[]> {
    const response = await this.messageRepo.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } }
      ],
      relations: { sender: true, receiver: true },
      order: { createdAt: 'DESC' }
    })
    return response
  }
  async changeStatus(data: Messages): Promise<Messages | null> {
    const response = await this.messageRepo.save(data)
    if (!response) return null
    return response
  }
  async findById(data: number): Promise<Messages | null> {
    const response = await this.messageRepo.findOne({
      where: { id: data },
      relations: { sender: true, receiver: true }
    })
    console.log(response)
    if (!response) return null
    return response
  }
  async create(data: Messages): Promise<Messages | null> {
    const response = await this.messageRepo.save(data)
    if (!response) return null
    return response
  }
}
