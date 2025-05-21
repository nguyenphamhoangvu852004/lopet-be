import { Profiles } from '~/entities/profiles.entity'
import { GetListInputDTO } from '~/modules/profile/dto/Get'

export default interface IProfileRepo {
  findAll(data: GetListInputDTO): Promise<Profiles[]>
  findById(id: number): Promise<Profiles | null>
  findByAccountId(id: number): Promise<Profiles | null>
  create(data: Profiles): Promise<Profiles | null>
  update(id: number, data: Profiles): Promise<Profiles | null>
  setToAccount(acountId: number, profileId: Profiles): Promise<Profiles | null>
}
