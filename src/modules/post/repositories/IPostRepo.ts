import { Posts } from '~/entities/posts.entity'

export default interface IPostRepo {
  getAll(): Promise<Posts[]>
  getOne(id): Promise<Posts | null>
  getByAccountId(id: number): Promise<Posts[]>
  create(data: Posts): Promise<Posts | null>
  delete(id: number): Promise<Posts | null>
}
