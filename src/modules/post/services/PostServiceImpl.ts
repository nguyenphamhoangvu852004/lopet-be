import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import { CreatePostInputDTO, CreatePostOutputDTO } from '~/modules/post/dto/Create'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import IPostService from '~/modules/post/services/IPostService'
import { handleThrowError } from '~/utils/handle.util'

export default class PostServiceImpl implements IPostService {
  constructor(
    private postRepo: IPostRepo,
    private accountRepo: IAccountRepo,
    private groupRepo: IGroupRepo
  ) {
    this.postRepo = postRepo
    this.accountRepo = accountRepo
    this.groupRepo = groupRepo
  }
  async create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest()
      if (data.groupId != null) {
        // bài viết tạo trong nhốm
        const group = await this.groupRepo.findById(data.groupId)
        if (!group) throw new BadRequest()
      } else {
        // bài viết tạo trong trang cá nhân
      }
    } catch (error) {
      handleThrowError(error)
    }
  }
}
