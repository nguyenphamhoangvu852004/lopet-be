import { Comments } from '~/entities/comments.entity'

export interface ICommentRepo {
  create(data: Comments): Promise<Comments | null>
  getCommentAllFromPost(data: number): Promise<Comments[]>
}
