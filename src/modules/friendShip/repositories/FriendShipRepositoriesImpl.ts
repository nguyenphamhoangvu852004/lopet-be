import { log } from 'console'
import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { FriendShips } from '~/entities/friendShips.entity'
import IFriendShipRepositories from '~/modules/friendShip/repositories/IFriendShipRepositories'

export default class FriendShipRepositoriesImpl implements IFriendShipRepositories {
  private friendShipRepo: Repository<FriendShips>
  constructor() {
    this.friendShipRepo = appDataSource.getRepository(FriendShips)
  }
  async create(data: FriendShips): Promise<FriendShips | null> {
    const response = await this.friendShipRepo.save(data)
    if (!response) return null
    return response
  }
}
