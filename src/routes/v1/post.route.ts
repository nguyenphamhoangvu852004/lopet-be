import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Posts } from '~/entities/posts.entity'
import { requireOwnership } from '~/middlewares/requireOwnership'
import { requirePermission } from '~/middlewares/requirePermission'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import { PostController } from '~/modules/post/controller'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'
import PostLikeRepoImpl from '~/modules/postLike/repositories/PostLikeRepoImpl'
import { PostMediaRepositoriesImpl } from '~/modules/postMedia/repositories/PostMediaRepositoriesImpl'
import { asyncHandler } from '~/utils/asyncHandler'

export const postRouter = Router()

const postRepo = new PostRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const postMediaRepo = new PostMediaRepositoriesImpl()
const postLikesRepo = new PostLikeRepoImpl()
const service = new PostServiceImpl(
  postRepo,
  accountRepo,
  groupRepo,
  postMediaRepo,
  postLikesRepo
)
const controller = new PostController(service)

/**
 * Sửa bài: KHÔNG cho ADMIN bỏ qua. Sửa nội dung của người khác không phải
 * việc của kiểm duyệt viên — kiểm duyệt thì xoá, không viết hộ.
 */
const mustOwnPostToEdit = requireOwnership<Posts>({
  load: (req) => postRepo.getOne(Number(req.params.postId)),
  ownerOf: (post) => post.accounts?.id,
  bypassRoles: []
})

/** Xoá bài: ADMIN/MODERATOR có quyền post:delete được bỏ qua ownership */
const mustOwnPostToDelete = requireOwnership<Posts>({
  load: (req) => postRepo.getOne(Number(req.params.id)),
  ownerOf: (post) => post.accounts?.id
})

postRouter.get(
  '/suggest',
  asyncHandler(controller.getSuggestList.bind(controller))
)
postRouter.get('/', asyncHandler(controller.getAll.bind(controller)))
postRouter.get('/:id', asyncHandler(controller.getById.bind(controller)))
postRouter.get(
  '/accounts/:id',
  asyncHandler(controller.getByAccountId.bind(controller))
)

postRouter.post(
  '/',
  asyncHandler(verifyToken()),
  requirePermission('post:create'),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
  ]),
  asyncHandler(controller.create.bind(controller))
)

/**
 * Trước đây route này chỉ có verifyToken và service cũng không kiểm gì:
 * bất kỳ ai đăng nhập cũng xoá được bài của người khác.
 */
postRouter.delete(
  '/:id',
  asyncHandler(verifyToken()),
  requirePermission('post:delete:own', 'post:delete'),
  mustOwnPostToDelete,
  asyncHandler(controller.delete.bind(controller))
)

postRouter.post(
  '/like',
  asyncHandler(verifyToken()),
  asyncHandler(controller.like.bind(controller))
)
postRouter.post(
  '/unlike',
  asyncHandler(verifyToken()),
  asyncHandler(controller.unlike.bind(controller))
)

postRouter.put(
  '/:postId',
  asyncHandler(verifyToken()),
  requirePermission('post:update:own'),
  // Đặt trước upload.fields(): chặn sớm để request bị từ chối không kịp
  // tốn lượt upload lên Cloudinary
  mustOwnPostToEdit,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
  ]),
  asyncHandler(controller.update.bind(controller))
)
