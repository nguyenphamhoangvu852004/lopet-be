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
