import { CreatePostInputDTO, CreatePostOutputDTO } from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import { GetPostByAccountIdOutputDTO, GetPostDetailOutputDTO, GetPostOutputDTO } from '~/modules/post/dto/Get'
import { LikePostInputDTO, LikePostOuputDTO, UnlikePostInputDTO, UnlikePostOutputDTO } from '~/modules/post/dto/React'

export default interface IPostService {
  getAll(): Promise<GetPostOutputDTO[]>
  getOneById(id): Promise<GetPostDetailOutputDTO>
  getByAccountId(id: number): Promise<GetPostByAccountIdOutputDTO[]>
  create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO>
  delete(id: number): Promise<DeletePostOutputDTO>
  like(data: LikePostInputDTO): Promise<LikePostOuputDTO>
  unLike(data: UnlikePostInputDTO): Promise<UnlikePostOutputDTO>
}
