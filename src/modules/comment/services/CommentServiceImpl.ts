import { Comments } from '~/entities/comments.entity'
import { BadRequest } from '~/error/error.custom'
import { GetAccountOutputDTO } from '~/modules/account/dto/Get'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import {
  CreateCommentInputDTO,
  CreateCommentOutputDTO
} from '~/modules/comment/dto/Create'
import {
  DeleteCommentInputDTO,
  DeleteCommentOutputDTO
} from '~/modules/comment/dto/Delete'
import {
  CommentOutputDTO,
  GetCommentOutputDTO
} from '~/modules/comment/dto/Get'
import { ICommentRepo } from '~/modules/comment/repositories/ICommentRepo'
import { ICommentService } from '~/modules/comment/services/ICommentService'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import IProfileRepo from '~/modules/profile/repositories/IProfileRepo'

export class CommentServiceImpl implements ICommentService {
  constructor(
    private commentRepo: ICommentRepo,
    private accountRepo: IAccountRepo,
    private postRepo: IPostRepo,
    private profileRepo: IProfileRepo
  ) {
    this.commentRepo = commentRepo
    this.accountRepo = accountRepo
    this.postRepo = postRepo
    this.profileRepo = profileRepo
  }
  async delete(data: DeleteCommentInputDTO): Promise<DeleteCommentOutputDTO> {
    // kiếm comment
    const comment = await this.commentRepo.findCommentById(data.commentId)
    if (!comment) throw new BadRequest('No comment found')
    // Quyền sở hữu đã được middleware requireOwnership kiểm ở tầng route.
    // Không lặp lại ở đây vì middleware cho staff (post:delete) bỏ qua ownership
    // để kiểm duyệt, còn kiểm tra tại service lại chặn đúng nhóm đó.
    // xóa comment
    const response = await this.commentRepo.delete(comment.id)
    if (!response) throw new BadRequest('Delete comment failed')
    return new DeleteCommentOutputDTO({
      commentId: response.id
    })
  }
  async getCommentAllFromPost(data: number): Promise<GetCommentOutputDTO> {
    // kiếm bài post
    const post = await this.postRepo.getOne(data)
    if (!post) throw new BadRequest('No post found')
    // kiếm tất cả các comment trong bài post
    const comments = await this.commentRepo.getCommentAllFromPost(post.id)

    const dto = new GetCommentOutputDTO({
      postId: post.id,
      comments: []
    })
    for (const comment of comments) {
      const dtoComment = new CommentOutputDTO({
        id: comment.id,
        content: comment.text,
        imageUrl: comment.images
      })
      const profile = await this.profileRepo.findByAccountId(comment.account.id)
      const account = new GetAccountOutputDTO({
        id: comment.account.id,
        username: comment.account.username,
        email: comment.account.email
      })
      account.profile = {
        id: profile?.id ?? 0,
        avatarUrl: profile?.avatarUrl ?? '',
        coverUrl: profile?.coverUrl ?? '',
        bio: profile?.bio ?? '',
        fullName: profile?.fullName ?? '',
        phoneNumber: profile?.phoneNumber ?? '',
        sex: profile?.sex ?? 0,
        dateOfBirth: profile?.dateOfBirth ?? new Date(),
        hometown: profile?.hometown ?? ''
      }
      dtoComment.createdAt = comment.createdAt
      dtoComment.account = account
      dtoComment.replyToCommentId = comment.parent?.id ?? undefined
      dto.comments.push(dtoComment)
    }
    return dto
  }

  async create(data: CreateCommentInputDTO): Promise<CreateCommentOutputDTO> {
    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new BadRequest('No account found')
    const post = await this.postRepo.getOne(data.postId)
    if (!post) throw new BadRequest('No post found')
    let parent
    if (data.replyCommentId) {
      const comment = await this.commentRepo.findCommentById(
        data.replyCommentId
      )
      if (!comment) throw new BadRequest('No comment found')
      parent = comment
    }

    const entity = new Comments({
      images: data.imageUrl ?? '',
      text: data.content,
      account: account,
      parent: parent ?? null,
      post: post,
      updatedAt: null
    })

    const response = await this.commentRepo.create(entity)
    if (!response) throw new BadRequest()
    const dto = new CreateCommentOutputDTO({
      commentId: response.id
    })

    return dto
  }
}
