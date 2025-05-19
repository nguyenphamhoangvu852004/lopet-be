import IPostService from '~/modules/post/services/IPostService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { CreatePostInputDTO } from '~/modules/post/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'

export class PostController {
  constructor(private postService: IPostService) {
    this.postService = postService
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const response = await this.postService.create(
        new CreatePostInputDTO({
          accountId: data.accountId,
          content: data.content,
          groupId: data.groupId,
          images: data.images ?? null,
          videos: data.videos ?? null
        })
      )
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Create post successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
