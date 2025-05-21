import { Profiles } from '~/entities/profiles.entity'
import { CreateProfileInputDTO, CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { GetListInputDTO, GetProfileOutputDTO } from '~/modules/profile/dto/Get'
import { UpdateProfileInputDTO, UpdateProfileOutputDTO } from '~/modules/profile/dto/Update'

export default interface IProfileService {
  findAll(data: GetListInputDTO): Promise<GetProfileOutputDTO[]>
  create(data: CreateProfileInputDTO): Promise<CreateProfileOutputDTO>
  findById(data: number): Promise<Profiles>
  findByAccountId(data: number): Promise<GetProfileOutputDTO>
  update(data: UpdateProfileInputDTO): Promise<UpdateProfileOutputDTO>
  setToAccount(data: number, accountId: number): Promise<GetProfileOutputDTO>
}
