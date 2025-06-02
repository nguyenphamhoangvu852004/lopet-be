import IPostService from '~/modules/post/services/IPostService'
import { Request, Response } from 'express'
import { handleControllerError } from '~/utils/handle.util'
import { CreatePostInputDTO, PostMediaInputDTO } from '~/modules/post/dto/Create'
import { ApiResponse, sendResponse } from '~/response/api.response'
import { httpStatusCode } from '~/global/httpStatusCode'
import cloudinary from '~/config/cloudinary'
import { logger } from '~/config/logger'
import { MEDIATYPE } from '~/entities/postMedias.entity'
import { LikePostInputDTO, UnlikePostInputDTO } from '~/modules/post/dto/React'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'
import { POSTSCOPE } from '~/entities/posts.entity'
import { UpdatePostInputDTO } from '~/modules/post/dto/Update'
import { BadRequest } from '~/error/error.custom'

export class PostController {
  constructor(private postService: IPostService) {
    this.postService = postService
  }
  async update(req: Request, res: Response) {
    try {
      const { postId } = req.params
      const data = req.body
      const files = req.files as { images?: Express.Multer.File[]; videos?: Express.Multer.File[] }

      const uploadedMedias: PostMediaInputDTO[] = []

      // Upload images
      if (files?.images?.length) {
        for (const image of files.images) {
          const rs = await cloudinary.uploader.upload(image.path, { resource_type: 'image' })
          uploadedMedias.push(
            new PostMediaInputDTO({
              mediaUrl: rs.secure_url,
              mediaType: MEDIATYPE.IMAGE
            })
          )
        }
      }

      // Upload videos
      if (files?.videos?.length) {
        for (const video of files.videos) {
          const rs = await cloudinary.uploader.upload(video.path, { resource_type: 'video' })
          uploadedMedias.push(
            new PostMediaInputDTO({
              mediaUrl: rs.secure_url,
              mediaType: MEDIATYPE.VIDEO
            })
          )
        }
      }

      const oldIdsMedia: number[] = []
      if (data.oldIdsMedia) {
        if (Array.isArray(data.oldIdsMedia)) {
          oldIdsMedia.push(...data.oldIdsMedia.map(Number))
        } else {
          oldIdsMedia.push(Number(data.oldIdsMedia))
        }
      }

      const dto = new UpdatePostInputDTO({
        postId: Number(postId),
        owner: Number(data.owner),
        oldIdsMedia,
        content: data.content,
        postMedias: uploadedMedias,
        scope: (() => {
          const isGroup = !!data.groupId
          const allowedScopes = isGroup ? ['PUBLIC', 'PRIVATE'] : ['PUBLIC', 'FRIEND', 'PRIVATE']
          if (!allowedScopes.includes(data.scope)) throw new BadRequest('Invalid scope')
          return data.scope
        })()
      })

      const response = await this.postService.update(dto)

      return sendResponse(
        new ApiResponse({
          res,
          statusCode: httpStatusCode.OK,
          message: 'Update post successfully',
          data: response
        })
      )
    } catch (err) {
      handleControllerError(err, res)
    }
  }

  async getSuggestList(req: Request, res: Response) {
    try {
      const response = await this.postService.getSuggestList()
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get suggest posts successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
  async getAll(req: Request, res: Response) {
    try {
      const content = req.query.content
      const safeContent = content && content !== 'undefined' ? String(content) : undefined

      const groupId = req.query.groupId
      const safeGroupId = groupId && groupId !== 'undefined' ? Number(groupId) : undefined

      const dto = new GetPostListInputDTO({
        content: safeContent,
        groupId: safeGroupId
      })
      const response = await this.postService.getAll(dto)
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Get posts successfully'
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
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
  async getByAccountId(req: Request, res: Response) {
    try {
      const response = await this.postService.getByAccountId(Number(req.params.id))
      sendResponse(
        new ApiResponse({
          data: response,
          res: res,
          statusCode: httpStatusCode.OK,
          message: `Get list by account id ${req.params.id} successfully`
        })
      )
    } catch (error) {
      handleControllerError(error, res)
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
        for (const video in files.videos) {
          const rs = await cloudinary.uploader.upload(files.videos[video].path, { resource_type: 'video' })
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

      if (data.groupId) {
        // Đây là bài viết trong group ⇒ chỉ cho phép PUBLIC hoặc PRIVATE
        if (data.scope === 'PUBLIC') {
          dto.scope = POSTSCOPE.PUBLIC
        } else if (data.scope === 'PRIVATE') {
          dto.scope = POSTSCOPE.PRIVATE
        } else {
          throw new BadRequest()
        }
      } else {
        // Đây là bài viết cá nhân
        if (data.scope === 'PUBLIC') {
          dto.scope = POSTSCOPE.PUBLIC
        } else if (data.scope === 'FRIEND') {
          dto.scope = POSTSCOPE.FRIEND
        } else if (data.scope === 'PRIVATE') {
          dto.scope = POSTSCOPE.PRIVATE
        } else {
          throw new BadRequest()
        }
      }

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
  async like(req: Request, res: Response) {
    try {
      const { postId, accountId } = req.body
      const dto = new LikePostInputDTO({
        accountId: accountId,
        postId: postId
      })
      const response = await this.postService.like(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Like post successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }

  async unlike(req: Request, res: Response) {
    try {
      const { postId, accountId } = req.body
      const dto = new UnlikePostInputDTO({
        accountId: accountId,
        postId: postId
      })
      const response = await this.postService.unLike(dto)
      sendResponse(
        new ApiResponse({
          res: res,
          statusCode: httpStatusCode.OK,
          message: 'Unlike post successfully',
          data: response
        })
      )
    } catch (error) {
      handleControllerError(error, res)
      return
    }
  }
}
