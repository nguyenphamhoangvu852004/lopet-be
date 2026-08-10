import { Request, Router } from 'express'
import { upload } from '~/config/multerConfig'
import { Posts } from '~/entities/posts.entity'
import { optionalAuth } from '~/middlewares/optionalAuth'
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
 * Nạp bài cho các kiểm tra sở hữu, ĐÃ lọc theo quyền xem của người gọi.
 *
 * Cố ý dùng getOneVisibleTo chứ không phải getOne: requireOwnership trả NotFound
 * khi load() ra null và Forbidden khi có tài nguyên nhưng không phải chủ. Nếu
 * nạp bằng getOne (không lọc) thì hai lỗi đó phân biệt được "bài này tồn tại
 * nhưng không phải của bạn" với "không có bài nào" — đủ để quét id và biết bài
 * PRIVATE nào đang tồn tại, dù không đọc được nội dung.
 *
 * Chủ bài luôn tự xem được bài mình (nhánh C của visibleTo), nên bộ lọc này
 * không bao giờ chặn nhầm người có quyền thật. Staff kiểm duyệt cũng không ảnh
 * hưởng: requireOwnership xét bypassRoles TRƯỚC khi gọi load().
 */
const loadVisiblePost = (idParam: string) => (req: Request) =>
  postRepo.getOneVisibleTo(Number(req.params[idParam]), Number(req.user?.id))

/**
 * Sửa bài: KHÔNG cho ADMIN bỏ qua. Sửa nội dung của người khác không phải
 * việc của kiểm duyệt viên — kiểm duyệt thì xoá, không viết hộ.
 */
const mustOwnPostToEdit = requireOwnership<Posts>({
  load: loadVisiblePost('postId'),
  ownerOf: (post) => post.accounts?.id,
  bypassRoles: []
})

/** Xoá bài: ADMIN/MODERATOR có quyền post:delete được bỏ qua ownership */
const mustOwnPostToDelete = requireOwnership<Posts>({
  load: loadVisiblePost('id'),
  ownerOf: (post) => post.accounts?.id
})

/**
 * Bốn route đọc dưới đây trước kia hoàn toàn không có middleware xác thực, nên
 * server không biết người gọi là ai và không thể áp postScope — mọi bài PRIVATE
 * và FRIEND của mọi tài khoản đều đọc được bởi khách vãng lai.
 *
 * Dùng optionalAuth chứ không phải verifyToken: giữ nguyên khả năng xem nội
 * dung công khai khi chưa đăng nhập, đồng thời nhận diện được người đã đăng
 * nhập để mở đúng phần nội dung họ được xem. Việc lọc nằm ở tầng repo
 * (postVisibility.ts), không phải ở đây.
 */
postRouter.get(
  '/suggest',
  optionalAuth(),
  asyncHandler(controller.getSuggestList.bind(controller))
)
postRouter.get('/', optionalAuth(), asyncHandler(controller.getAll.bind(controller)))
postRouter.get(
  '/:id',
  optionalAuth(),
  asyncHandler(controller.getById.bind(controller))
)
postRouter.get(
  '/accounts/:id',
  optionalAuth(),
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
