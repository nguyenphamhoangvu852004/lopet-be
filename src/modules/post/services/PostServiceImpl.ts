import { PostLikes } from '~/entities/postLikes.entity'
import { MEDIATYPE, PostMedias } from '~/entities/postMedias.entity'
import { Posts } from '~/entities/posts.entity'
import { BadRequest, NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import { CreatePostInputDTO, CreatePostOutputDTO, PostMediaInputDTO } from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import {
  AccountDTO,
  GetPostByAccountIdOutputDTO,
  GetPostDetailOutputDTO,
  GetPostListInputDTO,
  GetPostOutputDTO
} from '~/modules/post/dto/Get'
import { LikePostInputDTO, LikePostOuputDTO, UnlikePostInputDTO, UnlikePostOutputDTO } from '~/modules/post/dto/React'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import IPostService from '~/modules/post/services/IPostService'
import IPostLikeRepo from '~/modules/postLike/repositories/IPostLikeRepo'
import { IPostMediaRepositories } from '~/modules/postMedia/repositories/IPostMediaRepositories'
import { handleThrowError } from '~/utils/handle.util'

export default class PostServiceImpl implements IPostService {
  constructor(
    private postRepo: IPostRepo,
    private accountRepo: IAccountRepo,
    private groupRepo: IGroupRepo,
    private postMediaRepo: IPostMediaRepositories,
    private postLikesRepo: IPostLikeRepo
  ) {
    this.postRepo = postRepo
    this.accountRepo = accountRepo
    this.groupRepo = groupRepo
    this.postMediaRepo = postMediaRepo
    this.postLikesRepo = postLikesRepo
  }
  async getByAccountId(id: number): Promise<GetPostByAccountIdOutputDTO[]> {
    try {
      const listEntity = await this.postRepo.getByAccountId(id)

      if (!listEntity) throw new NotFound()
      const listOutDto: GetPostByAccountIdOutputDTO[] = []
      for (const item of listEntity) {
        console.log(item)
        const dto = new GetPostByAccountIdOutputDTO({
          content: item.content,
          groupId: item.group?.id ?? null,
          postId: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? null,
          postType: item.postType,
          likeAmount: item.postLikes.length,
          postMedias: []
        })

        if (!dto.postMedias) {
          dto.postMedias = []
        }
        for (const i of item.postMedias) {
          const postMedia = new PostMediaInputDTO({
            mediaUrl: i.mediaUrl,
            mediaType: i.mediaType,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt ?? null
          })
          dto.postMedias.push(postMedia)
        }
        listOutDto.push(dto)
      }
      return listOutDto
    } catch (error) {
      handleThrowError(error)
    }
  }
  async getAll(data: GetPostListInputDTO): Promise<GetPostOutputDTO[]> {
    try {
      const listEntity = await this.postRepo.getAll(data)
      if (!listEntity) throw new NotFound()
      const listOutDto: GetPostOutputDTO[] = []
      for (const item of listEntity) {
        console.log(item)
        const dto = new GetPostOutputDTO({
          accountId: item.accounts.id,
          content: item.content,
          groupId: item.group?.id ?? null,
          postId: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? null,
          postType: item.postType,
          likeAmount: item.postLikes.length,
          postMedias: []
        })

        if (!dto.postMedias) {
          dto.postMedias = []
        }
        for (const i of item.postMedias) {
          const postMedia = new PostMediaInputDTO({
            mediaUrl: i.mediaUrl,
            mediaType: i.mediaType,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt ?? null
          })
          dto.postMedias.push(postMedia)
        }
        listOutDto.push(dto)
      }
      return listOutDto
    } catch (error) {
      handleThrowError(error)
    }
  }

  async getOneById(id): Promise<GetPostDetailOutputDTO> {
    try {
      const response: Posts | null = await this.postRepo.getOne(id)
      if (!response) throw new NotFound()
      const dto = new GetPostDetailOutputDTO({
        accountId: response.accounts.id,
        content: response.content,
        groupId: response.group?.id ?? null,
        postId: response.id,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt ?? null,
        likeAmount: response.postLikes.length,
        postType: response.postType,
        listLike: [],
        postMedias: []
      })
      if (!dto.postMedias) {
        dto.postMedias = []
      }
      const account = await this.accountRepo.findById(response.accounts.id)
      if (!account) throw new BadRequest()
      dto.listLike.push(
        new AccountDTO({
          id: account.id,
          username: account.username,
          email: account.email
        })
      )
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

  async like(data: LikePostInputDTO): Promise<LikePostOuputDTO> {
    try {
      const post = await this.postRepo.getOne(data.postId)
      if (!post) throw new BadRequest()

      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest()

      // ✅ Kiểm tra like đã tồn tại hay chưa bằng repo
      const existingLike = await this.postLikesRepo.findByAccountAndPost(account.id, post.id)
      if (existingLike) {
        return new LikePostOuputDTO({
          message: 'You have already liked this post'
        })
      }

      const postLike = new PostLikes({
        post: post,
        account: account
      })

      await this.postLikesRepo.create(postLike)

      return new LikePostOuputDTO({
        message: 'Like post successfully'
      })
    } catch (error) {
      handleThrowError(error)
    }
  }

  async unLike(data: UnlikePostInputDTO): Promise<UnlikePostOutputDTO> {
    try {
      const post = await this.postRepo.getOne(data.postId)
      if (!post) throw new BadRequest()

      const account = await this.accountRepo.findById(data.accountId)
      if (!account) throw new BadRequest()

      const existingLike = await this.postLikesRepo.findByAccountAndPost(account.id, post.id)
      if (!existingLike) {
        return new UnlikePostOutputDTO({
          message: 'You have already unliked this post' // đúng rồi nè
        })
      }

      // ✅ Xoá đúng entity có ID
      await this.postLikesRepo.delete(existingLike)

      return new UnlikePostOutputDTO({
        message: 'Unlike post successfully'
      })
    } catch (error) {
      handleThrowError(error)
    }
  }
}
