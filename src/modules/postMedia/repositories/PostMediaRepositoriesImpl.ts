import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { PostMedias } from '~/entities/postMedias.entity'
import { IPostMediaRepositories } from '~/modules/postMedia/repositories/IPostMediaRepositories'

export class PostMediaRepositoriesImpl implements IPostMediaRepositories {
  private postMediaRepo: Repository<PostMedias>
  constructor() {
    this.postMediaRepo = appDataSource.getRepository(PostMedias)
  }
  async create(data: PostMedias): Promise<PostMedias | null> {
    const response = await this.postMediaRepo.save(data)
    if (!response) return null
    return response
  }
}
