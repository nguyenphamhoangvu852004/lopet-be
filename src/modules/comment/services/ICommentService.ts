import { Comments } from '~/entities/comments.entity'
import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'

export interface ICommentService {
  create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO>
}
