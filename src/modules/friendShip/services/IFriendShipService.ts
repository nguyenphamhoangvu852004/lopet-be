import {
  ChangeStatusFriendShipInputDTO,
  ChangeStatusFriendShipOutputDTO
} from '~/modules/friendShip/dto/ChangeStatusFriend'
import { CreateFriendShipInputDTO, CreateFriendShipOutputDTO } from '~/modules/friendShip/dto/Create'
import { DeleteFriendShipInputDTO, DeleteFriendShipOutputDTO } from '~/modules/friendShip/dto/Delete'
import { GetFriendShipOutputDTO } from '~/modules/friendShip/dto/Get'

export interface IFriendShipService {
  getListSendFriendShips(data: number): Promise<GetFriendShipOutputDTO>
  getListFriendShipsOfAccount(data: number): Promise<GetFriendShipOutputDTO>
  create(data: CreateFriendShipInputDTO): Promise<CreateFriendShipOutputDTO>
  changeStatus(data: ChangeStatusFriendShipInputDTO): Promise<ChangeStatusFriendShipOutputDTO>
  delete(data: DeleteFriendShipInputDTO): Promise<DeleteFriendShipOutputDTO>
}
