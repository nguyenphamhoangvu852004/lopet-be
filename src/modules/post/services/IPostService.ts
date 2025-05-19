import { CreatePostInputDTO, CreatePostOutputDTO } from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import { GetPostOutputDTO } from '~/modules/post/dto/Get'

export default interface IPostService {
  getOneById(id): Promise<GetPostOutputDTO>
  create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO>
delete(id:number):Promise<DeletePostOutputDTO>
}
