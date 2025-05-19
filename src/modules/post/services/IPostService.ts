import { CreatePostInputDTO, CreatePostOutputDTO } from '~/modules/post/dto/Create'

export default interface IPostService {
  create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO>
}
