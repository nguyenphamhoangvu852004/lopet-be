import { Request, Response } from 'express'
import cloudinary from '~/config/cloudinary'
import { httpStatusCode } from '~/global/httpStatusCode'
import { CreateCommentInputDTO } from '~/modules/comment/dto/Create'
import { ICommentService } from '~/modules/comment/services/ICommentService'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { handleControllerError } from '~/utils/handle.util'
export class CommentController {
  constructor(private commentService: ICommentService) {
    this.commentService = commentService
  }
  async create(req: Request, res: Response) {
    try {
      const { accountId, content, replyCommentId, postId } = req.body
      let imageUrl = ''
      if (req.file) {
        const rs = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
        imageUrl = rs.secure_url ?? ''
      }
      const dto = new CreateCommentInputDTO({
        accountId: accountId,
        content: content,
        imageUrl: imageUrl,
        replyCommentId: replyCommentId ?? null,
        postId: postId
      })
      const response = await this.commentService.create(dto)

      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Created comment successfully',
          data: response
        })
      )
      return
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async getCommentAllFromPost(req: Request, res: Response) {
    try {
      const { postId } = req.params
      console.log(postId)
      const response = await this.commentService.getCommentAllFromPost(Number(postId))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get comment successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
