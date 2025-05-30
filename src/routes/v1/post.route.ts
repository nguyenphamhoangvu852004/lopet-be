import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import { verifyToken } from '~/middlewares/verifyToken'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import { PostController } from '~/modules/post/controller'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'
import PostLikeRepoImpl from '~/modules/postLike/repositories/PostLikeRepoImpl'
import { PostMediaRepositoriesImpl } from '~/modules/postMedia/repositories/PostMediaRepositoriesImpl'

export const postRouter = Router()

const postRepo = new PostRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const postMediaRepo = new PostMediaRepositoriesImpl()
const postLikesRepo = new PostLikeRepoImpl()
const service = new PostServiceImpl(postRepo, accountRepo, groupRepo, postMediaRepo, postLikesRepo)
const controller = new PostController(service)

postRouter.get('/suggest', controller.getSuggestList.bind(controller))
postRouter.get('/', controller.getAll.bind(controller))
postRouter.get('/:id', controller.getById.bind(controller))
postRouter.get('/accounts/:id', controller.getByAccountId.bind(controller))
postRouter.post(
  '/',
  verifyToken(),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
  ]),
  controller.create.bind(controller)
)

postRouter.delete('/:id', verifyToken(), controller.delete.bind(controller))

postRouter.post('/like', verifyToken(), controller.like.bind(controller))
postRouter.post('/unlike', verifyToken(), controller.unlike.bind(controller))
postRouter.put(
  '/:postId',
  verifyToken(),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
  ]),
  controller.update.bind(controller)
)
