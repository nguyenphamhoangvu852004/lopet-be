import IPostService from '~/modules/post/services/IPostService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { CreatePostInputDTO, PostMediaInputDTO } from '~/modules/post/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import cloudinary from '~/config/cloudinary'
import { logger } from '~/config/logger'
import { MEDIATYPE } from '~/entities/postMedias.entity'

export class PostController {
  constructor(private postService: IPostService) {
    this.postService = postService
  }
  async getById(req: Request, res: Response) {
    try {
      const response = await this.postService.getOneById(Number(req.params.id))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get post successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const files = req.files as { images?: Express.Multer.File[]; videos?: Express.Multer.File[] }
      const images: PostMediaInputDTO[] = []
      const videos: PostMediaInputDTO[] = []
      if (files.images) {
        for (const image of files.images) {
          const rs = await cloudinary.uploader.upload(image.path, { resource_type: 'image' })
          const imageDTO = new PostMediaInputDTO({
            mediaUrl: rs.secure_url,
            mediaType: rs.resource_type == 'image' ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO
          })
          images.push(imageDTO)
          logger.info(image)
        }
      }
      if (files.videos) {
        for (const video of files.videos) {
          const rs = await cloudinary.uploader.upload(files.videos[0].path, { resource_type: 'video' })
          const videoDTO = new PostMediaInputDTO({
            mediaUrl: rs.secure_url,
            mediaType: rs.resource_type == 'image' ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO
          })
          videos.push(videoDTO)
          logger.info(video)
        }
      }
      const dto = new CreatePostInputDTO({
        accountId: data.accountId,
        content: data.content,
        groupId: data.groupId ?? null, // nếu như groupId có giá trị thì cái loại bài viết này nó là bài viết GROUP, còn không thì nó là bài của USER
        postMedias: [...images, ...videos]
      })
      const response = await this.postService.create(new CreatePostInputDTO(dto))
      console.log(response)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.CREATED,
          message: 'Create post successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const response = await this.postService.delete(Number(req.params.id))
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Delete post successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
