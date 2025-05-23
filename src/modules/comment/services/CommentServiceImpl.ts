import { Comments } from '~/entities/comments.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'
import { ICommentRepo } from '~/modules/comment/repositories/ICommentRepo'
import { ICommentService } from '~/modules/comment/services/ICommentService'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import { handleThrowError } from '~/utils/handle.util'

export class CommentServiceImpl implements ICommentService {
  constructor(
    private commentRepo: ICommentRepo,
    private accountRepo: IAccountRepo,
    private postRepo: IPostRepo
  ) {
    this.commentRepo = commentRepo
    this.accountRepo = accountRepo
    this.postRepo = postRepo
  }

  async create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO> {
    try {
      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest('No account found')
      const post = await this.postRepo.getOne(data.postId)
      if (!post) throw new BadRequest('No post found')

      const entity = new Comments({
        images: data.imageUrl ?? '',
        text: data.content,
        account: account,
        post: post,
        updatedAt: null
      })

      const response = await this.commentRepo.create(entity)
      if (!response) throw new BadRequest()
      const dto = new CreateCommentOutputDTO({
        commentId: response.id
      })

      return dto
    } catch (error) {
      handleThrowError(error)
    }
  }
}
