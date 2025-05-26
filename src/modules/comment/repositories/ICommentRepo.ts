import { Comments } from '~/entities/comments.entity'

export interface ICommentRepo {
  create(data: Comments): Promise<Comments | null>
  findCommentById(id: number): Promise<Comments | null>
  getCommentAllFromPost(data: number): Promise<Comments[]>
  delete(id: number): Promise<Comments | null>
}
