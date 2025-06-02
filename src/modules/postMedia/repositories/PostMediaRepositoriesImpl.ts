import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { PostMedias } from '~/entities/postMedias.entity'
import { IPostMediaRepositories } from '~/modules/postMedia/repositories/IPostMediaRepositories'

export class PostMediaRepositoriesImpl implements IPostMediaRepositories {
  private postMediaRepo: Repository<PostMedias>
  constructor() {
    this.postMediaRepo = mySqlDataSource.getRepository(PostMedias)
  }
  async deleteNotIn(postId: number, keepIds: number[]): Promise<void> {
    const qb = this.postMediaRepo.createQueryBuilder().delete().from(PostMedias).where('post_id = :postId', { postId })

    if (keepIds.length > 0) {
      qb.andWhere('id NOT IN (:...keepIds)', { keepIds })
    }

    await qb.execute()
  }

  async getById(id: number): Promise<PostMedias | null> {
    const response = await this.postMediaRepo.findOne({ where: { id: id }, relations: { post: true } })
    console.log(`id: ${id}`)
    console.log(response)
    if (!response) return null
    return response
  }

  async deleteByPostId(postId: number): Promise<PostMedias[] | null> {
    const response = await this.postMediaRepo.find({
      where: { post: { id: postId } },
      relations: { post: true }
    })
    if (!response) return null
    const deleteResponse = await this.postMediaRepo.remove(response)
    if (!deleteResponse) return null
    return deleteResponse
  }
  async getByPostId(postId: number): Promise<PostMedias[]> {
    const response = await this.postMediaRepo.find({
      where: { post: { id: postId } },
      relations: { post: true }
    })
    return response
  }
  async create(data: PostMedias): Promise<PostMedias | null> {
    const response = await this.postMediaRepo.save(data)
    if (!response) return null
    return response
  }
}
