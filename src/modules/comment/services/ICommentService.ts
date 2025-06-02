import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'
import { DeleteCommentInputDTO, DeleteCommentOutputDTO } from '~/modules/comment/dto/Delete'
import { GetCommentOutputDTO } from '~/modules/comment/dto/Get'

export interface ICommentService {
  create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO>
  getCommentAllFromPost(data: number): Promise<GetCommentOutputDTO>
  delete(data: DeleteCommentInputDTO): Promise<DeleteCommentOutputDTO>
}
