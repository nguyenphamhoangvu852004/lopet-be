import { Posts } from '~/entities/posts.entity'

export default interface IPostRepo {
  getOne(id): Promise<Posts | null>
  create(data: Posts): Promise<Posts | null>
  delete(id: number): Promise<Posts | null>
}
