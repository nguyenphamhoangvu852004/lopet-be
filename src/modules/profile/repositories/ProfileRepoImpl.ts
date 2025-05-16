import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { Profiles } from '~/entities/profiles.entity'
import { CreateProfileDTO } from '~/modules/profile/dto/Create'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'

export default class ProfileRepoImpl implements IProfileRepo {
  private profileRepo: Repository<Profiles>
  constructor() {
    this.profileRepo = appDataSource.getRepository(Profiles)
  }
  async findById(id: number): Promise<Profiles | null> {
    const profile: Profiles | null = await this.profileRepo.findOneBy({ id })
    if (!profile) {
      return null
    }
    return profile
  }

  async create(data: CreateProfileDTO): Promise<Profiles> {
    const newEntity = new Profiles({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      avatarUrl: data.avatarUrl,
      coverUrl: data.coverUrl
    })
    const createdEntity = await this.profileRepo.save(newEntity)
    if (!createdEntity) {
      throw new Error('Bad Request')
    }
    return createdEntity
  }
}
