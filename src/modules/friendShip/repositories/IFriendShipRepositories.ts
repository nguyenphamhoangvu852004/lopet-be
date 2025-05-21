import { FriendShips } from '~/entities/friendShips.entity'

export default interface IFriendShipRepositories {
  create(data: FriendShips): Promise<FriendShips | null>
}
