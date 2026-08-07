import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Comments } from '~/entities/comments.entity'
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

/** Xoá bình luận: chủ bình luận, hoặc staff có quyền post:delete (kiểm duyệt) */
const mustOwnComment = requireOwnership<Comments>({
  load: (req) => commentRepo.findCommentById(Number(req.params.commentId)),
  ownerOf: (comment) => comment.account?.id
})

commentRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('comment:create'),
  upload.single('image'),
  asyncHandler(controller.create.bind(controller))
)

commentRouter.get(
  '/:postId',
  asyncHandler(controller.getCommentAllFromPost.bind(controller))
)

commentRouter.delete(
  '/:commentId',
  asyncHandler(verifyToken()),
  requirePermission('comment:delete:own', 'post:delete'),
  mustOwnComment,
  asyncHandler(controller.delete.bind(controller))
)
