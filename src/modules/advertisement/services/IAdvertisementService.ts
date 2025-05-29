import { CreateAdvertsementInputDTO, CreateAdvertsementOutputDTO } from '~/modules/advertisement/dto/Create'
import { DeleteAdvertsementOutputDTO } from '~/modules/advertisement/dto/Delete'
import { GetDetailAdvertisementOutputDTO } from '~/modules/advertisement/dto/Get'
import { UpdateAdvertsementInputDTO, UpdateAdvertsementOutputDTO } from '~/modules/advertisement/dto/Update'

export interface IAdvertisementService {
  getList(accountId): Promise<GetDetailAdvertisementOutputDTO[]>
  create(data: CreateAdvertsementInputDTO): Promise<CreateAdvertsementOutputDTO>
  getDetail(data: number): Promise<GetDetailAdvertisementOutputDTO>
  delet(data: number): Promise<DeleteAdvertsementOutputDTO>
  update(data: UpdateAdvertsementInputDTO): Promise<UpdateAdvertsementOutputDTO>
}
