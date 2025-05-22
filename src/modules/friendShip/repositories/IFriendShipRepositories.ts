import { Accounts } from '~/entities/accounts.entity'
import { FriendShips } from '~/entities/friendShips.entity'

export default interface IFriendShipRepositories {
  create(data: FriendShips): Promise<FriendShips | null>
  delete(data: FriendShips): Promise<FriendShips | null>
  changeStatus(data: FriendShips): Promise<FriendShips | null>
  findBySenderAndReceiver(senderId: number, receiverId: number): Promise<FriendShips | null>
  findAllSendFriendShips(senderId: number): Promise<FriendShips[]>
  findAllFriendOfAccount(accountId: number): Promise<Accounts[]>
}
