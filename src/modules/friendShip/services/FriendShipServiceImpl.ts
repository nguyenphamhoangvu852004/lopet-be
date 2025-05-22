import { FriendShips, FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import {
  ChangeStatusFriendShipInputDTO,
  ChangeStatusFriendShipOutputDTO
} from '~/modules/friendShip/dto/ChangeStatusFriend'
import { CreateFriendShipInputDTO, CreateFriendShipOutputDTO } from '~/modules/friendShip/dto/Create'
import { DeleteFriendShipInputDTO, DeleteFriendShipOutputDTO } from '~/modules/friendShip/dto/Delete'
import { GetFriendShipOutputDTO, Receiver } from '~/modules/friendShip/dto/Get'
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
  async getListFriendShipsOfAccount(data: number): Promise<GetFriendShipOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data)
      if (!account) throw new BadRequest()
      const list = await this.friendShipRepo.findAllFriendOfAccount(data)
      const listReceiver: Receiver[] = []
      for (const item of list) {
        const receiver = await this.accountRepo.findById(item.id)
        if (!receiver) throw new BadRequest()
        const receiverDTO = new Receiver({
          id: receiver.id,
          username: receiver.username,
          email: receiver.email,
          imageUrl: receiver.profile?.avatarUrl ?? '',
          status: FRIENDSHIPSTATUS.ACCEPTED
        })
        listReceiver.push(receiverDTO)
      }
      const outputDTO = new GetFriendShipOutputDTO({
        sender: new Receiver({
          id: account.id,
          username: account.username,
          email: account.email,
          imageUrl: account.profile?.avatarUrl ?? ''
        }),
        receivers: listReceiver
      })
      return outputDTO
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getListSendFriendShips(data: number): Promise<GetFriendShipOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data)
      if (!account) throw new BadRequest()
      const list = await this.friendShipRepo.findAllSendFriendShips(data)
      const listReceiver: Receiver[] = []
      for (const item of list) {
        const receiver = await this.accountRepo.findById(item.receiver.id)
        if (!receiver) throw new BadRequest()
        const receiverDTO = new Receiver({
          id: receiver.id,
          username: receiver.username,
          email: receiver.email,
          imageUrl: receiver.profile?.avatarUrl ?? '',
          status: item.status
        })
        listReceiver.push(receiverDTO)
      }

      const outputDTO = new GetFriendShipOutputDTO({
        sender: new Receiver({
          id: account.id,
          username: account.username,
          email: account.email,
          imageUrl: account.profile?.avatarUrl ?? '',
        }),
        receivers: listReceiver
      })
      return outputDTO
    } catch (error) {
      handleThrowError(error)
    }
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

  async changeStatus(data: ChangeStatusFriendShipInputDTO): Promise<ChangeStatusFriendShipOutputDTO> {
    try {
      const { senderId, receiverId, status } = data
      const sender = await this.accountRepo.findById(senderId)
      if (!sender) throw new BadRequest()
      const receiver = await this.accountRepo.findById(receiverId)
      if (!receiver) throw new BadRequest()
      const entity = await this.friendShipRepo.findBySenderAndReceiver(senderId, receiverId)
      if (!entity) throw new BadRequest()
      entity.status = status
      const response = await this.friendShipRepo.changeStatus(entity)
      if (!response) throw new BadRequest()
      return new ChangeStatusFriendShipOutputDTO({
        senderId: response.sender.id,
        receiverId: response.receiver.id,
        status: response.status
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async delete(data: DeleteFriendShipInputDTO): Promise<DeleteFriendShipOutputDTO> {
    try {
      const { senderId, receiverId } = data
      const sender = await this.accountRepo.findById(senderId)
      if (!sender) throw new BadRequest()
      const receiver = await this.accountRepo.findById(receiverId)
      if (!receiver) throw new BadRequest()
      const entity = await this.friendShipRepo.findBySenderAndReceiver(senderId, receiverId)
      if (!entity) throw new BadRequest()
      const response = await this.friendShipRepo.delete(entity)
      if (!response) throw new BadRequest()
      return new DeleteFriendShipOutputDTO({
        senderId: response.sender.id,
        receiverId: response.receiver.id,
        isSuccess: true
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
