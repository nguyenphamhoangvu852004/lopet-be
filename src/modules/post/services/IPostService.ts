import { CreatePostInputDTO, CreatePostOutputDTO } from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import {
  GetPostByAccountIdOutputDTO,
  GetPostDetailOutputDTO,
  GetPostListInputDTO,
  GetPostOutputDTO
} from '~/modules/post/dto/Get'
import { LikePostInputDTO, LikePostOuputDTO, UnlikePostInputDTO, UnlikePostOutputDTO } from '~/modules/post/dto/React'
import { UpdatePostInputDTO, UpdatePostOutputDTO } from '~/modules/post/dto/Update'

/**
 * `viewerId` lấy từ token qua optionalAuth, `undefined` = khách chưa đăng nhập.
 * Mọi luồng đọc bài đều phải truyền tham số này xuống repo để lọc quyền riêng
 * tư (xem postVisibility.ts).
 */
export default interface IPostService {
  update(data: UpdatePostInputDTO): Promise<UpdatePostOutputDTO>
  getSuggestList(viewerId?: number): Promise<GetPostOutputDTO[]>
  getAll(data: GetPostListInputDTO): Promise<GetPostOutputDTO[]>
  getOneById(id, viewerId?: number): Promise<GetPostDetailOutputDTO>
  getByAccountId(
    id: number,
    viewerId?: number
  ): Promise<GetPostByAccountIdOutputDTO[]>
  create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO>
  delete(id: number): Promise<DeletePostOutputDTO>
  like(data: LikePostInputDTO): Promise<LikePostOuputDTO>
  unLike(data: UnlikePostInputDTO): Promise<UnlikePostOutputDTO>
}
