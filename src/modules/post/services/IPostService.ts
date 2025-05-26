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

export default interface IPostService {
  update(data: UpdatePostInputDTO): Promise<UpdatePostOutputDTO>
  getSuggestList(): Promise<GetPostOutputDTO[]>
  getAll(data: GetPostListInputDTO): Promise<GetPostOutputDTO[]>
  getOneById(id): Promise<GetPostDetailOutputDTO>
  getByAccountId(id: number): Promise<GetPostByAccountIdOutputDTO[]>
  create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO>
  delete(id: number): Promise<DeletePostOutputDTO>
  like(data: LikePostInputDTO): Promise<LikePostOuputDTO>
  unLike(data: UnlikePostInputDTO): Promise<UnlikePostOutputDTO>
}
