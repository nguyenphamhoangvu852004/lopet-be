import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import { PostController } from '~/modules/post/controller'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'
import { PostMediaRepositoriesImpl } from '~/modules/postMedia/repositories/PostMediaRepositoriesImpl'

export const postRouter = Router()

const postRepo = new PostRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const postMediaRepo = new PostMediaRepositoriesImpl()
const service = new PostServiceImpl(postRepo, accountRepo, groupRepo, postMediaRepo)
const controller = new PostController(service)

postRouter.get('/:id', controller.getById.bind(controller))
postRouter.post(
  '/',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 5 }
  ]),
  controller.create.bind(controller)
)

postRouter.delete('/:id', controller.delete.bind(controller))
