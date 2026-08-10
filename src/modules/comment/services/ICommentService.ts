import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'
import { DeleteCommentInputDTO, DeleteCommentOutputDTO } from '~/modules/comment/dto/Delete'
import { GetCommentOutputDTO } from '~/modules/comment/dto/Get'

export interface ICommentService {
  create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO>
  /** `viewerId` từ optionalAuth; undefined = khách. Lọc theo quyền xem bài. */
  getCommentAllFromPost(
    data: number,
    viewerId?: number
  ): Promise<GetCommentOutputDTO>
  delete(data: DeleteCommentInputDTO): Promise<DeleteCommentOutputDTO>
}
