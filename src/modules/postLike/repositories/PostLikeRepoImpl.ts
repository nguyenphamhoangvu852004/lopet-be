import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { PostLikes } from '~/entities/postLikes.entity'
import IPostLikeRepo from '~/modules/postLike/repositories/IPostLikeRepo'

export default class PostLikeRepoImpl implements IPostLikeRepo {
  private postLikeRepo: Repository<PostLikes>

  constructor() {
    this.postLikeRepo = mySqlDataSource.getRepository(PostLikes)
  }
  async create(data: PostLikes): Promise<PostLikes | null> {
    const response = await this.postLikeRepo.save(data)
    if (!response) return null
    return response
  }

  async delete(data: PostLikes): Promise<PostLikes | null> {
    const response = await this.postLikeRepo.remove(data)
    if (!response) return null
    return response
  }
  async findByAccountAndPost(accountId: number, postId: number): Promise<PostLikes | null> {
    return await this.postLikeRepo.findOne({
      where: {
        account: { id: accountId },
        post: { id: postId }
      },
      relations: {
        account: true,
        post: true
      }
    })
  }
}
