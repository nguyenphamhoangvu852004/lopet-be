import { log } from 'console'
import { Profiles } from '~/entities/profiles.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import { CreateProfileInputDTO, CreateProfileOutputDTO } from '~/modules/profile/dto/Create'
import { GetListInputDTO, GetProfileOutputDTO } from '~/modules/profile/dto/Get'
import { UpdateProfileInputDTO, UpdateProfileOutputDTO } from '~/modules/profile/dto/Update'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'
import IProfileService from '~/modules/profile/services/IProfileService'
import { handleThrowError } from '~/utils/handle.util'

export default class ProfileServiceImpl implements IProfileService {
  constructor(private profileRepo: IProfileRepo) {
    this.profileRepo = profileRepo
  }
  async findAll(data: GetListInputDTO): Promise<GetProfileOutputDTO[]> {
    try {
      const response = await this.profileRepo.findAll(data)
      const list: GetProfileOutputDTO[] = []
      for (const profile of response) {
        list.push(
          new GetProfileOutputDTO({
            id: profile.id,
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            coverUrl: profile.coverUrl,
            dateOfBirth: profile.dateOfBirth,
            hometown: profile.hometown,
            sex: profile.sex
          })
        )
      }
      return list
    } catch (error) {
      handleThrowError(error)
    }
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
          dateOfBirth: data.dateOfBirth ?? undefined,
          hometown: data.hometown ?? undefined,
          sex: data.sex ?? undefined,
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null
        })
      )

      if (!newProfile) throw new BadRequest()
      return new CreateProfileOutputDTO({
        id: newProfile.id,
        fullName: newProfile.fullName,
        phoneNumber: newProfile.phoneNumber,
        bio: newProfile.bio,
        avatarUrl: newProfile.avatarUrl,
        coverUrl: newProfile.coverUrl,
        dateOfBirth: newProfile.dateOfBirth,
        hometown: newProfile.hometown,
        sex: newProfile.sex
      })
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
        coverUrl: response.coverUrl,
        dateOfBirth: response.dateOfBirth,
        hometown: response.hometown,
        sex: response.sex
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
      profile.sex = data.sex ?? profile.sex
      profile.dateOfBirth = data.dateOfBirth ?? profile.dateOfBirth
      profile.hometown = data.hometown ?? profile.hometown
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
