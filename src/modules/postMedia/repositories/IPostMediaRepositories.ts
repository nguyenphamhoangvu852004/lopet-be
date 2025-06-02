import { PostMedias } from '~/entities/postMedias.entity'

export interface IPostMediaRepositories {
  create(data: PostMedias): Promise<PostMedias | null>
  getByPostId(postId: number): Promise<PostMedias[]>
  deleteByPostId(postId: number): Promise<PostMedias[] | null>
  deleteNotIn(postId: number, keepIds: number[]): Promise<void>
  getById(id: number): Promise<PostMedias | null>
}
