import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Accounts } from '~/entities/accounts.entity'
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
    const isEsist = await this.findBySenderAndReceiver(data.sender.id, data.receiver.id)
    if (isEsist) return null
    const response = await this.friendShipRepo.save(data)
    if (!response) return null
    return response
  }

  async findAllSendFriendShips(senderId: number): Promise<FriendShips[]> {
    const response = await this.friendShipRepo.find({
      where: {
        sender: { id: senderId },
        status: FRIENDSHIPSTATUS.PENDING
      },
      relations: ['receiver'] // nếu muốn lấy info người được gửi lời mời
    })
    return response
  }

  async findAllFriendOfAccount(accountId: number): Promise<Accounts[]> {
    const friendships = await this.friendShipRepo
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('(sender.id = :accountId OR receiver.id = :accountId)', { accountId })
      .andWhere('friendship.status = :status', { status: FRIENDSHIPSTATUS.ACCEPTED })
      .getMany()

    // Trả về người còn lại (người bạn của userId)
    const friends = friendships.map((f) => {
      return f.sender.id === accountId ? f.receiver : f.sender
    })
    return friends
  }
  async findAllReceivedFriendRequests(accountId: number): Promise<Accounts[]> {
    const friendRequests = await this.friendShipRepo
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .where('friendship.receiver = :accountId', { accountId })
      .andWhere('friendship.status = :status', { status: FRIENDSHIPSTATUS.PENDING })
      .getMany()
    // Lấy người gửi (sender) ra

    return friendRequests.map((f) => f.sender)
  }
}
