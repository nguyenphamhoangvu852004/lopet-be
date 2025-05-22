import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { FriendShips, FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import IFriendShipRepositories from '~/modules/friendShip/repositories/IFriendShipRepositories'

export default class FriendShipRepositoriesImpl implements IFriendShipRepositories {
  private friendShipRepo: Repository<FriendShips>
  constructor() {
    this.friendShipRepo = mySqlDataSource.getRepository(FriendShips)
  }
  async findBySenderAndReceiver(senderId: number, receiverId: number): Promise<FriendShips | null> {
    const response = await this.friendShipRepo.findOne({
      where: { sender: { id: senderId }, receiver: { id: receiverId } }
    })
    return response
  }

  async delete(data: FriendShips): Promise<FriendShips | null> {
    const response = await this.friendShipRepo.remove(data)
    if (!response) return null
    return response
  }
  async changeStatus(data: FriendShips): Promise<FriendShips | null> {
    const response = await this.friendShipRepo.save(data)
    if (!response) return null
    return response
  }

  async create(data: FriendShips): Promise<FriendShips | null> {
    const response = await this.friendShipRepo.save(data)
    if (!response) return null
    return response
  }

  async findAllSendFriendShips(senderId: number): Promise<FriendShips[]> {
    const response = await this.friendShipRepo.find({ where: { sender: { id: senderId } } })
    return response
  }

  async findAllFriendOfAccount(accountId: number): Promise<FriendShips[]> {
    const response = await this.friendShipRepo.find({
      where: [
        { sender: { id: accountId }, status: FRIENDSHIPSTATUS.ACCEPTED },
        { receiver: { id: accountId }, status: FRIENDSHIPSTATUS.ACCEPTED }
      ],
      relations: ['sender', 'receiver']
    })
    return response
  }
}
