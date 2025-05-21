import { CreateFriendShipInputDTO, CreateFriendShipOutputDTO } from '~/modules/friendShip/dto/Create'

export interface IFriendShipService {
  create(data: CreateFriendShipInputDTO): Promise<CreateFriendShipOutputDTO>
}
