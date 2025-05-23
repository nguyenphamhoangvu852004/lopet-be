import { Advertisements } from '~/entities/advertisements.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateAdvertsementInputDTO, CreateAdvertsementOutputDTO } from '~/modules/advertisement/dto/Create'
import { DeleteAdvertsementOutputDTO } from '~/modules/advertisement/dto/Delete'
import { Author, GetDetailAdvertisementOutputDTO } from '~/modules/advertisement/dto/Get'
import { IAdvertisementRepositories } from '~/modules/advertisement/repositories/IAdvertisementRepositories'
import { IAdvertisementService } from '~/modules/advertisement/services/IAdvertisementService'
import { handleThrowError } from '~/utils/handle.util'

export class AdvertisementServiceImpl implements IAdvertisementService {
  constructor(
    private advertisementRepo: IAdvertisementRepositories,
    private accountRepo: IAccountRepo
  ) {
    this.advertisementRepo = advertisementRepo
    this.accountRepo = accountRepo
  }
  async delet(data: number): Promise<DeleteAdvertsementOutputDTO> {
    try {
      const response = await this.advertisementRepo.findById(data)
      if (!response) throw new BadRequest()
      const result = await this.advertisementRepo.delete(response)
      if (!result) throw new BadRequest()
      return new DeleteAdvertsementOutputDTO({ message: 'Delete success' })
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getDetail(data: number): Promise<GetDetailAdvertisementOutputDTO> {
    try {
      const response = await this.advertisementRepo.findById(data)
      if (!response) throw new BadRequest()
      const author = new Author({
        email: response.account.email,
        id: response.account.id,
        username: response.account.username
      })
      const dto = new GetDetailAdvertisementOutputDTO({
        createdAt: response.createdAt,
        updatedAt: response.updatedAt ?? undefined,
        deletedAt: response.deletedAt ?? undefined,
        description: response.description,
        id: response.id,
        imageUrl: response.imageUrl,
        linkReferfence: response.linkReferfence,
        title: response.title,
        author: author
      })
      return dto
    } catch (err) {
      handleThrowError(err)
    }
  }
  async getList(accountId): Promise<GetDetailAdvertisementOutputDTO[]> {
    try {
      const list = await this.advertisementRepo.findAll(accountId)
      const response: GetDetailAdvertisementOutputDTO[] = []
      for (const item of list) {
        const author = new Author({
          email: item.account.email,
          id: item.account.id,
          username: item.account.username
        })
        const dto = new GetDetailAdvertisementOutputDTO({
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? undefined,
          deletedAt: item.deletedAt ?? undefined,
          description: item.description,
          id: item.id,
          imageUrl: item.imageUrl,
          linkReferfence: item.linkReferfence,
          title: item.title,
          author: author
        })
        response.push(dto)
      }
      return response
    } catch (error) {
      handleThrowError(error)
    }
  }

  async create(data: CreateAdvertsementInputDTO): Promise<CreateAdvertsementOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest()

      const entity = new Advertisements({
        account: account,
        createdAt: new Date(),
        description: data.description,
        imageUrl: data.imageurl,
        linkReferfence: data.linkref,
        title: data.title
      })
      const response = await this.advertisementRepo.create(entity)
      if (!response) throw new BadRequest()

      const outDto = new CreateAdvertsementOutputDTO({
        id: response.id
      })
      return outDto
    } catch (error) {
      handleThrowError(error)
    }
  }
}
