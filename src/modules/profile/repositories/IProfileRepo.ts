import { Profiles } from '~/entities/profiles.entity'

export default interface IProfileRepo {
  findById(id: number): Promise<Profiles | null>
  findByAccountId(id: number): Promise<Profiles | null>
  create(data: Profiles): Promise<Profiles | null>
  update(id: number, data: Profiles): Promise<Profiles | null>
  setToAccount(acountId: number, profileId: Profiles): Promise<Profiles | null>
}
