import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'
import { GetCommentOutputDTO } from '~/modules/comment/dto/Get'

export interface ICommentService {
  create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO>
  getCommentAllFromPost(data: number): Promise<GetCommentOutputDTO>
}
