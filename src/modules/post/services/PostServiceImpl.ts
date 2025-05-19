import { MEDIATYPE, PostMedias } from '~/entities/postMedias.entity'
import { Posts } from '~/entities/posts.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import { CreatePostInputDTO, CreatePostOutputDTO, PostMediaInputDTO } from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import { GetPostOutputDTO } from '~/modules/post/dto/Get'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import IPostService from '~/modules/post/services/IPostService'
import { IPostMediaRepositories } from '~/modules/postMedia/repositories/IPostMediaRepositories'
import { handleThrowError } from '~/utils/handle.util'

export default class PostServiceImpl implements IPostService {
  constructor(
    private postRepo: IPostRepo,
    private accountRepo: IAccountRepo,
    private groupRepo: IGroupRepo,
    private postMediaRepo: IPostMediaRepositories
  ) {
    this.postRepo = postRepo
    this.accountRepo = accountRepo
    this.groupRepo = groupRepo
    this.postMediaRepo = postMediaRepo
  }

  async getOneById(id): Promise<GetPostOutputDTO> {
    try {
      const response: Posts | null = await this.postRepo.getOne(id)
      if (!response) throw new NotFound()
      const dto = new GetPostOutputDTO({
        accountId: response.accounts.id,
        content: response.content,
        groupId: response.group?.id ?? null,
        postId: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt ?? null,
        postType: response.postType,
        postMedias: []
      })
      if (!dto.postMedias) {
        dto.postMedias = []
      }
      for (const item of response.postMedias) {
        const postMedia = new PostMediaInputDTO({
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? null
        })
        dto.postMedias.push(postMedia)
      }
      return dto
    } catch (error) {
      handleThrowError(error)
    }
  }
  async create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO> {
    try {
      // tìm account
      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest()

      // tìm group nếu có gữi lên group

      const newPostEntity: Posts = new Posts({
        accounts: account,
        content: data.content
      })

      if (data.groupId) {
        const group = await this.groupRepo.findById(data.groupId)
        if (!group) {
          newPostEntity.group = null
        } else {
          newPostEntity.group = group
        }
      }
      newPostEntity.setType()
      const response: Posts | null = await this.postRepo.create(newPostEntity)
      if (!response) throw new BadRequest()
      // lấy dc postId

      const result: CreatePostOutputDTO = new CreatePostOutputDTO({
        accountId: response.accounts.id,
        content: response.content,
        postId: response.id,
        postType: response.postType,
        groupId: response.group ? response.group.id : null,
        updatedAt: new Date(),
        createdAt: new Date(),
        postMedias: []
      })

      for (const item of data.postMedias as PostMediaInputDTO[]) {
        const newPostMediaEntity: PostMedias = new PostMedias({
          post: response,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType === 'IMAGE' ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO
        })
        const responsePostMedia = await this.postMediaRepo.create(newPostMediaEntity)
        if (!responsePostMedia) throw new BadRequest()
        // Map PostMedias entity to PostMediaInputDTO
        const postMediaDTO: PostMediaInputDTO = {
          mediaUrl: responsePostMedia.mediaUrl,
          mediaType: responsePostMedia.mediaType,
          updatedAt: new Date(), // fallback to current date if null
          createdAt: new Date()
        }
        result.postMedias?.push(postMediaDTO)
      }

      return result
    } catch (error) {
      handleThrowError(error)
    }
  }

  async delete(id: number): Promise<DeletePostOutputDTO> {
    try {
      const response = await this.postRepo.delete(id)
      if (!response) throw new BadRequest()
      return new DeletePostOutputDTO({ id: response.id })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
