import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Comments } from '~/entities/comments.entity'
import { ICommentRepo } from '~/modules/comment/repositories/ICommentRepo'

export class CommentRepoImpl implements ICommentRepo {
  private commentRepo: Repository<Comments>
  constructor() {
    this.commentRepo = mySqlDataSource.getRepository(Comments)
  }
  async delete(id: number): Promise<Comments | null> {
    const response = await this.commentRepo.findOne({ where: { id } })
    if (!response) return null
    const deleteResponse = await this.commentRepo.remove(response)
    if (!deleteResponse) return null
    return deleteResponse
  }
  async getCommentAllFromPost(data: number): Promise<Comments[]> {
    const response = await this.commentRepo.find({
      where: { post: { id: data } },
      relations: { account: true, replies: true, parent: true },
      order: { createdAt: 'DESC' }
    })
    return response
  }
  async create(data: Comments): Promise<Comments | null> {
    const response = await this.commentRepo.save(data)
    if (!response) return null
    return response
  }

  async findCommentById(id: number): Promise<Comments | null> {
    const response = await this.commentRepo.findOne({
      where: { id },
      relations: { account: true, replies: true }
    })
    if (!response) return null
    return response
  }
}
