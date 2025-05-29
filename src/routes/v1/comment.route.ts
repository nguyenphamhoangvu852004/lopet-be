import { Router } from 'express'
import { upload } from '~/config/multerConfig'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { CommentController } from '~/modules/comment/controller'
import { CommentRepoImpl } from '~/modules/comment/repositories/CommentRepoImpl'
import { CommentServiceImpl } from '~/modules/comment/services/CommentServiceImpl'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'

const commentRepo = new CommentRepoImpl()
const accountRepo = new AccountRepoImpl()
const postRepo = new PostRepoImpl()
const profileRepo = new ProfileRepoImpl()
const service = new CommentServiceImpl(commentRepo, accountRepo, postRepo, profileRepo)
const controller = new CommentController(service)
export const commentRouter = Router()

commentRouter.post('/', upload.single('image'), controller.create.bind(controller))
commentRouter.get('/:postId', controller.getCommentAllFromPost.bind(controller))
commentRouter.delete('/:commentId', controller.delete.bind(controller))
