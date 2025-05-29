import { Posts } from '~/entities/posts.entity'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'

export default interface IPostRepo {
  getSuggestList(): Promise<Posts[]>
  getAll(data: GetPostListInputDTO): Promise<Posts[]>
  getOne(id): Promise<Posts | null>
  update(data: Posts): Promise<Posts | null>
  getByAccountId(id: number): Promise<Posts[]>
  create(data: Posts): Promise<Posts | null>
  delete(id: number): Promise<Posts | null>
}
