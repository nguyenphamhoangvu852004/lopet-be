import { Profiles } from '~/entities/profiles.entity'
import { CreateProfileDTO } from '~/modules/profile/dto/Create'

export default interface IProfileRepo {
  findById(id: number): Promise<Profiles | null>
  create(data: CreateProfileDTO): Promise<Profiles>
}
