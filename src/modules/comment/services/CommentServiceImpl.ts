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
  /**
   * Bình luận thừa hưởng quyền riêng tư của bài viết chứa nó. Trước đây hàm này
   * nạp bài bằng getOne() không lọc, còn route thì không có xác thực — nên danh
   * sách bình luận (kèm username/email người bình luận) của một bài PRIVATE vẫn
   * đọc được bởi khách vãng lai, dù thân bài đã được che.
   */
  async getCommentAllFromPost(
    data: number,
    viewerId?: number
  ): Promise<GetCommentOutputDTO> {
    // kiếm bài post — bản có lọc quyền xem
    const post = await this.postRepo.getOneVisibleTo(data, viewerId)
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
    // Không bình luận được vào bài mà mình không có quyền xem
    const post = await this.postRepo.getOneVisibleTo(
      data.postId,
      data.accountId
    )
    if (!post) throw new BadRequest('No post found')
    let parent
    if (data.replyCommentId) {
      const comment = await this.commentRepo.findCommentById(
        data.replyCommentId
      )
      if (!comment) throw new BadRequest('No comment found')
      // Comment cha PHẢI thuộc đúng bài vừa được kiểm quyền ở trên. Nếu không
      // đối chiếu, chỉ cần ghép postId của một bài mình xem được với
      // replyCommentId lấy từ bài PRIVATE của người khác là tạo được reply gắn
      // vào cây bình luận đó — quyền xem đã kiểm trên bài này nhưng comment cha
      // lại nằm ở bài kia, tức là kiểm nhầm tài nguyên.
      if (comment.post?.id !== post.id) {
        throw new BadRequest('No comment found')
      }
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
