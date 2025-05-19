import { Posts } from '~/entities/posts.entity'

export default interface IPostRepo {
  create(data: Posts): Promise<Posts | null>
}
