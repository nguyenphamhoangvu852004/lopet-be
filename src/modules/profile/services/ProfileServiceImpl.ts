import { log } from 'console'
import { Profiles } from '~/entities/profiles.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import { CreateProfileInputDTO, CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { GetProfileOutputDTO } from '~/modules/profile/dto/Get'
import { UpdateProfileInputDTO, UpdateProfileOutputDTO } from '~/modules/profile/dto/Update'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'
import IProfileService from '~/modules/profile/services/IProfileService'
import { handleThrowError } from '~/utils/handle.util'

export default class ProfileServiceImpl implements IProfileService {
  constructor(private profileRepo: IProfileRepo) {
    this.profileRepo = profileRepo
  }

  async create(data: CreateProfileInputDTO): Promise<CreateProfileOutputDTO> {
    try {
      const newProfile = await this.profileRepo.create(
        new Profiles({
          fullName: data.fullName ?? '',
          phoneNumber: data.phoneNumber ?? '',
          bio: data.bio ?? '',
          avatarUrl: data.avatarUrl ?? '',
          coverUrl: data.coverUrl ?? '',
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null
        })
      )

      if (!newProfile) throw new BadRequest()
      return new CreateProfileOutputDTO(newProfile)
    } catch (error) {
      handleThrowError(error)
    }
  }
  async findById(data: number): Promise<Profiles> {
    try {
      const response = await this.profileRepo.findById(data)
      if (!response) throw new NotFound()
      return response
    } catch (error) {
      handleThrowError(error)
    }
  }

  async findByAccountId(data: number): Promise<GetProfileOutputDTO> {
    try {
      const response = await this.profileRepo.findByAccountId(data)
      if (!response) throw new NotFound()
      return new GetProfileOutputDTO({
        id: response.id,
        fullName: response.fullName,
        phoneNumber: response.phoneNumber,
        bio: response.bio,
        avatarUrl: response.avatarUrl,
        coverUrl: response.coverUrl
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
  async update(data: UpdateProfileInputDTO): Promise<UpdateProfileOutputDTO> {
    try {
      const profile: Profiles | null = await this.profileRepo.findById(data.id)
      if (!profile) throw new BadRequest()
      profile.fullName = data.fullName ?? profile.fullName
      profile.phoneNumber = data.phoneNumber ?? profile.phoneNumber
      profile.bio = data.bio ?? profile.bio
      profile.avatarUrl = data.avatarUrl ?? profile.avatarUrl
      profile.coverUrl = data.coverUrl ?? profile.coverUrl
      profile.updatedAt = new Date()
      await this.profileRepo.update(profile.id, profile)
      return new UpdateProfileOutputDTO(profile)
    } catch (error) {
      handleThrowError(error)
    }
  }

  async setToAccount(data: number, accountId: number): Promise<GetProfileOutputDTO> {
    try {
      log(data, accountId)
      const profile: Profiles | null = await this.profileRepo.findById(data)
      if (!profile) throw new BadRequest()
      const response = await this.profileRepo.setToAccount(accountId, profile)
      if (!response) throw new BadRequest()
      return new GetProfileOutputDTO({
        id: response.id,
        fullName: response.fullName,
        phoneNumber: response.phoneNumber,
        bio: response.bio,
        avatarUrl: response.avatarUrl,
        coverUrl: response.coverUrl
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
