import { Accounts } from '~/entities/accounts.entity'
import { FriendShips } from '~/entities/friendShips.entity'

export default interface IFriendShipRepositories {
  create(data: FriendShips): Promise<FriendShips | null>
  delete(data: FriendShips): Promise<FriendShips | null>
  changeStatus(data: FriendShips): Promise<FriendShips | null>
  findBySenderAndReceiver(
    senderId: number,
    receiverId: number
  ): Promise<FriendShips | null>
  /**
   * Hai tài khoản đã là bạn bè (ACCEPTED) hay chưa, xét cả hai chiều.
   * Khác findBySenderAndReceiver ở chỗ có lọc trạng thái — lời mời đang PENDING
   * hay đã REJECTED/BLOCKED đều không tính là bạn bè.
   */
  areFriends(accountIdA: number, accountIdB: number): Promise<boolean>
  findAllSendFriendShips(senderId: number): Promise<FriendShips[]>
  findAllFriendOfAccount(accountId: number): Promise<Accounts[]>
  findAllReceivedFriendRequests(accountId: number): Promise<Accounts[]>
}
