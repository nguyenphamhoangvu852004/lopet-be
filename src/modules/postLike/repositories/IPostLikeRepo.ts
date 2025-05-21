import { PostLikes } from '~/entities/postLikes.entity'

export default interface IPostLikeRepo {
  create(data: PostLikes): Promise<PostLikes | null>
  delete(data: PostLikes): Promise<PostLikes | null>
  findByAccountAndPost(accountId: number, postId: number): Promise<PostLikes | null>
}
