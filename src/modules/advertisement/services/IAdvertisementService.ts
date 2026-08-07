import {
  CreateAdvertsementInputDTO,
  CreateAdvertsementOutputDTO
} from '~/modules/advertisement/dto/Create'
import { DeleteAdvertsementOutputDTO } from '~/modules/advertisement/dto/Delete'
import { GetDetailAdvertisementOutputDTO } from '~/modules/advertisement/dto/Get'
import {
  UpdateAdvertsementInputDTO,
  UpdateAdvertsementOutputDTO
} from '~/modules/advertisement/dto/Update'

export interface IAdvertisementService {
  getList(accountId?: number): Promise<GetDetailAdvertisementOutputDTO[]>
  create(data: CreateAdvertsementInputDTO): Promise<CreateAdvertsementOutputDTO>
  getDetail(data: number): Promise<GetDetailAdvertisementOutputDTO>
  /** accountId lấy từ req.user, dùng để kiểm tra ownership trước khi xoá */
  delet(data: number, accountId: number): Promise<DeleteAdvertsementOutputDTO>
  update(data: UpdateAdvertsementInputDTO): Promise<UpdateAdvertsementOutputDTO>
}
