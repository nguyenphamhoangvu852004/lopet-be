import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Comments } from '~/entities/comments.entity'
import { optionalAuth } from '~/middlewares/optionalAuth'
import { requireOwnership } from '~/middlewares/requireOwnership'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { CommentController } from '~/modules/comment/controller'
import { CommentRepoImpl } from '~/modules/comment/repositories/CommentRepoImpl'
import { CommentServiceImpl } from '~/modules/comment/services/CommentServiceImpl'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'
import { asyncHandler } from '~/utils/asyncHandler'

const commentRepo = new CommentRepoImpl()
const accountRepo = new AccountRepoImpl()
const postRepo = new PostRepoImpl()
const profileRepo = new ProfileRepoImpl()
const service = new CommentServiceImpl(
  commentRepo,
  accountRepo,
  postRepo,
  profileRepo
)
const controller = new CommentController(service)
export const commentRouter = Router()

/**
 * Xoá bình luận: chủ bình luận, hoặc staff có quyền post:delete (kiểm duyệt).
 *
 * Quyền trên bình luận LUÔN giải quyết qua bài cha, không qua bản thân bình
 * luận: nạp bình luận rồi mới đối chiếu xem người gọi có được xem bài chứa nó
 * không. Nếu chỉ nạp theo id, phản hồi 403 (tồn tại, không phải của bạn) và 404
 * (không tồn tại) sẽ khác nhau, đủ để quét id và biết bình luận nào đang tồn
 * tại trong một bài PRIVATE.
 *
 * Staff kiểm duyệt không bị ảnh hưởng: requireOwnership xét bypassRoles TRƯỚC
 * khi gọi load(), nên vẫn xoá được bình luận trong bài riêng tư bị báo cáo.
 */
const mustOwnComment = requireOwnership<Comments>({
  load: async (req) => {
    const comment = await commentRepo.findCommentById(
      Number(req.params.commentId)
    )
    if (!comment?.post) return null
    const post = await postRepo.getOneVisibleTo(
      comment.post.id,
      Number(req.user?.id)
    )
    return post ? comment : null
  },
  ownerOf: (comment) => comment.account?.id
})

commentRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('comment:create'),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)

/**
 * Bình luận kế thừa quyền riêng tư của bài viết: optionalAuth để nhận diện
 * người xem, service đối chiếu qua PostRepo.getOneVisibleTo().
 */
commentRouter.get(
  '/:postId',
  optionalAuth(),
  asyncHandler(controller.getCommentAllFromPost.bind(controller))
)

commentRouter.delete(
  '/:commentId',
  asyncHandler(verifyToken()),
  requirePermission('comment:delete:own', 'post:delete'),
  mustOwnComment,
  asyncHandler(controller.delete.bind(controller))
)
