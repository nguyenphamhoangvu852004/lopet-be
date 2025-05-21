import { FriendShips, FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateFriendShipInputDTO, CreateFriendShipOutputDTO } from '~/modules/friendShip/dto/Create'
import IFriendShipRepositories from '~/modules/friendShip/repositories/IFriendShipRepositories'
import { IFriendShipService } from '~/modules/friendShip/services/IFriendShipService'
import { handleThrowError } from '~/utils/handle.util'

export class FriendShipServiceImpl implements IFriendShipService {
  constructor(
    private friendShipRepo: IFriendShipRepositories,
    private accountRepo: IAccountRepo
  ) {
    this.friendShipRepo = friendShipRepo
    this.accountRepo = accountRepo
  }
  async create(data: CreateFriendShipInputDTO): Promise<CreateFriendShipOutputDTO> {
    try {
      const { senderId, receiverId } = data
      const sender = await this.accountRepo.findById(senderId)
      if (!sender) throw new BadRequest()
      const receiver = await this.accountRepo.findById(receiverId)
      if (!receiver) throw new BadRequest()
      const entity = new FriendShips({
        sender: sender,
        receiver: receiver,
        status: FRIENDSHIPSTATUS.PENDING,
        createdAt: new Date(),
        updatedAt: null
      })
      const response = await this.friendShipRepo.create(entity)
      if (!response) throw new BadRequest()
      return new CreateFriendShipOutputDTO({
        id: response.id,
        senderId: response.sender.id,
        receiverId: response.receiver.id,
        createdAt: response.createdAt
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
