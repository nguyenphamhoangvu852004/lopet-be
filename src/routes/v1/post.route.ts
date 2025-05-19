import { Router } from 'express'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import { PostController } from '~/modules/post/controller'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'

export const postRouter = Router()

const postRepo = new PostRepoImpl()
const accountRepo = new AccountRepoImpl()
const groupRepo = new GroupRepoImpl()
const service = new PostServiceImpl(postRepo, accountRepo, groupRepo)
const controller = new PostController(service)

postRouter.post('/', controller.create.bind(controller))
