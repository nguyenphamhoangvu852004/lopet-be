import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { Posts } from '~/entities/posts.entity'
import IPostRepo from '~/modules/post/repositories/IPostRepo'

export default class PostRepoImpl implements IPostRepo {
  private postRepo: Repository<Posts>
  constructor() {
    this.postRepo = appDataSource.getRepository(Posts)
  }
  async create(data: Posts): Promise<Posts | null> {
    const post = await this.postRepo.save(data)
    if (!post) {
      return null
    }
    return post
  }
}
