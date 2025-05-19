import { log } from 'console'
import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { Posts } from '~/entities/posts.entity'
import IPostRepo from '~/modules/post/repositories/IPostRepo'

export default class PostRepoImpl implements IPostRepo {
  private postRepo: Repository<Posts>

  constructor() {
    this.postRepo = appDataSource.getRepository(Posts)
  }

  async getOne(id): Promise<Posts | null> {
    const post = await this.postRepo.findOne({
      where: {
        id: id
      },
      relations: {
        accounts: true,
        postMedias: true,
        group: true
      }
    })
    if (!post) {
      return null
    }
    return post
  }

  async create(data: Posts): Promise<Posts | null> {
    log(data)
    const post = await this.postRepo.save(data)
    if (!post) {
      return null
    }
    return post
  }

  async delete(id: number): Promise<Posts | null> {
    const post = await this.postRepo.findOne({ where: { id } })
    if (!post) {
      return null
    }
    await this.postRepo.delete(id)
    return post
  }
}
