import { PostLikes } from '~/entities/postLikes.entity'
import { MEDIATYPE, PostMedias } from '~/entities/postMedias.entity'
import { Posts } from '~/entities/posts.entity'
import { BadRequest, Forbidden, NotFound } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import {
  CreatePostInputDTO,
  CreatePostOutputDTO,
  PostMediaInputDTO
} from '~/modules/post/dto/Create'
import { DeletePostOutputDTO } from '~/modules/post/dto/DeletePostOutputDTO'
import {
  AccountDTO,
  GetPostByAccountIdOutputDTO,
  GetPostDetailOutputDTO,
  GetPostListInputDTO,
  GetPostOutputDTO
} from '~/modules/post/dto/Get'
import {
  LikePostInputDTO,
  LikePostOuputDTO,
  UnlikePostInputDTO,
  UnlikePostOutputDTO
} from '~/modules/post/dto/React'
import {
  UpdatePostInputDTO,
  UpdatePostOutputDTO
} from '~/modules/post/dto/Update'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import IPostService from '~/modules/post/services/IPostService'
import { parseScope, resolveGroupForPost } from '~/modules/post/services/postPolicy'
import IPostLikeRepo from '~/modules/postLike/repositories/IPostLikeRepo'
import { IPostMediaRepositories } from '~/modules/postMedia/repositories/IPostMediaRepositories'

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
  async update(data: UpdatePostInputDTO): Promise<UpdatePostOutputDTO> {
    // 1. Tìm post
    const post = await this.postRepo.getOne(data.postId)
    if (!post) throw new BadRequest('Post not found')

    // 2. Kiểm tra quyền sở hữu
    if (post.accounts.id !== Number(data.owner)) {
      throw new Forbidden('You are not the owner of this post')
    }

    // 3. Cập nhật nội dung & scope.
    //    Scope hợp lệ được quyết theo group THẬT của bài (post.group đã nạp từ
    //    DB), không theo groupId client gửi lên — nếu tin body thì chỉ cần bỏ
    //    trống groupId là đặt được scope FRIEND cho một bài trong nhóm.
    //    Bài viết không đổi được group, nên đây cũng là group sau khi sửa.
    post.content = data.content
    post.postScope = parseScope(data.scope, post.group != null)

    const updatedPost = await this.postRepo.update(post)
    if (!updatedPost) throw new BadRequest('Update failed')

    // 4. Xoá media cũ không còn giữ
    await this.postMediaRepo.deleteNotIn(post.id, data.oldIdsMedia ?? [])

    // 5. Lấy lại danh sách media được giữ lại
    const listOldMedia: PostMedias[] = []
    if (data.oldIdsMedia) {
      for (const id of data.oldIdsMedia) {
        const media = await this.postMediaRepo.getById(id)
        if (!media) throw new BadRequest(`Old media not found: ID ${id}`)
        listOldMedia.push(media)
      }
    }

    // 6. Tạo media mới
    const listNewMedia: PostMedias[] = []
    for (const item of data.postMedias ?? []) {
      const newMedia = new PostMedias({
        post,
        mediaUrl: item.mediaUrl,
        mediaType:
          item.mediaType === 'IMAGE' ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO
      })

      const saved = await this.postMediaRepo.create(newMedia)
      if (!saved) throw new BadRequest('Save media failed')
      listNewMedia.push(saved)
    }

    // 7. Gộp danh sách media và trả về DTO
    const allMedia = [...listOldMedia, ...listNewMedia]
    const postMediaOutput: PostMediaInputDTO[] = allMedia.map((m) => ({
      id: m.id,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }))

    return new UpdatePostOutputDTO({
      owner: updatedPost.accounts.id,
      content: updatedPost.content,
      postId: updatedPost.id,
      postType: updatedPost.postType,
      scope: updatedPost.postScope,
      groupId: updatedPost.group?.id,
      updatedAt: new Date(),
      createdAt: updatedPost.createdAt,
      postMedias: postMediaOutput
    })
  }

  async getSuggestList(viewerId?: number): Promise<GetPostOutputDTO[]> {
    const listEntity = await this.postRepo.getSuggestList(viewerId)
    if (!listEntity) throw new NotFound()
    const listOutDto: GetPostOutputDTO[] = []
    for (const item of listEntity) {
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
  }
  async getByAccountId(
    id: number,
    viewerId?: number
  ): Promise<GetPostByAccountIdOutputDTO[]> {
    const listEntity = await this.postRepo.getByAccountId(id, viewerId)

    if (!listEntity) throw new NotFound()
    const listOutDto: GetPostByAccountIdOutputDTO[] = []
    for (const item of listEntity) {
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
  }
  async getAll(data: GetPostListInputDTO): Promise<GetPostOutputDTO[]> {
    const listEntity = await this.postRepo.getAll(data)
    if (!listEntity) throw new NotFound()
    const listOutDto: GetPostOutputDTO[] = []
    for (const item of listEntity) {
      const dto = new GetPostOutputDTO({
        accountId: item.accounts.id,
        content: item.content,
        groupId: item.group?.id ?? null,
        postId: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? null,
        postType: item.postType,
        likeAmount: item.postLikes.length,
        likeList: [],
        postMedias: []
      })

      if (!dto.postMedias) {
        dto.postMedias = []
      }
      for (const i of item.postMedias) {
        const postMedia = new PostMediaInputDTO({
          id: i.id,
          mediaUrl: i.mediaUrl,
          mediaType: i.mediaType,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt ?? null
        })
        dto.postMedias.push(postMedia)
      }
      listOutDto.push(dto)
      for (const i of item.postLikes) {
        const accountDto = new AccountDTO({
          id: i.account.id,
          username: i.account.username,
          email: i.account.email
        })
        dto.likeList.push(accountDto)
      }
    }
    return listOutDto
  }

  /**
   * Trả về NotFound (không phải Forbidden) khi người xem không đủ quyền: phản
   * hồi phải giống hệt trường hợp bài không tồn tại, nếu không endpoint này trở
   * thành công cụ dò xem một bài PRIVATE có tồn tại hay không.
   */
  async getOneById(id, viewerId?: number): Promise<GetPostDetailOutputDTO> {
    const response: Posts | null = await this.postRepo.getOneVisibleTo(
      Number(id),
      viewerId
    )
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
    // Bỏ lượt truy vấn accountRepo.findById ở đây: kết quả không được dùng vào
    // đâu cả, tác giả đã nằm sẵn trong response.accounts nhờ join.
    for (const item of response.postLikes) {
      const accountDto = new AccountDTO({
        id: item.account.id,
        username: item.account.username,
        email: item.account.email
      })
      dto.listLike.push(accountDto)
    }
    for (const item of response.postMedias) {
      const postMedia = new PostMediaInputDTO({
        id: item.id,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? null
      })
      dto.postMedias.push(postMedia)
    }
    return dto
  }
  async create(data: CreatePostInputDTO): Promise<CreatePostOutputDTO> {
    // tìm account
    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new BadRequest()

    // Đăng vào group thì phải được group đó cho phép — xem resolveGroupForPost.
    // Kiểm tra nằm ở đây chứ không ở route: route chỉ biết groupId trong body,
    // còn quyết định lại phụ thuộc group.type và tư cách thành viên.
    const group = data.groupId
      ? await resolveGroupForPost(this.groupRepo, data.groupId, account.id)
      : null

    const newPostEntity: Posts = new Posts({
      accounts: account,
      content: data.content,
      group
    })
    newPostEntity.setType()

    // Suy ra từ group đã nạp thật, không từ data.groupId
    newPostEntity.postScope = parseScope(data.scope, group !== null)

    const response: Posts | null = await this.postRepo.create(newPostEntity)

    if (!response) throw new BadRequest()
    // lấy dc postId

    const result: CreatePostOutputDTO = new CreatePostOutputDTO({
      accountId: response.accounts.id,
      content: response.content,
      postId: response.id,
      postType: response.postType,
      scope: response.postScope,
      groupId: response.group ? response.group.id : null,
      updatedAt: new Date(),
      createdAt: new Date(),
      postMedias: []
    })

    for (const item of data.postMedias as PostMediaInputDTO[]) {
      const newPostMediaEntity: PostMedias = new PostMedias({
        post: response,
        mediaUrl: item.mediaUrl,
        mediaType:
          item.mediaType === 'IMAGE' ? MEDIATYPE.IMAGE : MEDIATYPE.VIDEO
      })
      const responsePostMedia =
        await this.postMediaRepo.create(newPostMediaEntity)
      if (!responsePostMedia) throw new BadRequest()
      // Map PostMedias entity to PostMediaInputDTO
      const postMediaDTO: PostMediaInputDTO = {
        id: responsePostMedia.id,
        mediaUrl: responsePostMedia.mediaUrl,
        mediaType: responsePostMedia.mediaType,
        updatedAt: new Date(), // fallback to current date if null
        createdAt: new Date()
      }
      result.postMedias?.push(postMediaDTO)
    }

    return result
  }

  async delete(id: number): Promise<DeletePostOutputDTO> {
    const response = await this.postRepo.delete(id)
    if (!response) throw new BadRequest()
    return new DeletePostOutputDTO({ id: response.id })
  }

  async like(data: LikePostInputDTO): Promise<LikePostOuputDTO> {
    // Bài mình không có quyền xem thì cũng không thả tim được. Nếu nạp bằng
    // getOne() không lọc thì endpoint này thành công cụ dò: phản hồi khác nhau
    // giữa "bài không tồn tại" và "bài PRIVATE của người khác".
    const post = await this.postRepo.getOneVisibleTo(
      data.postId,
      data.accountId
    )
    if (!post) throw new BadRequest()

    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new BadRequest()

    // ✅ Kiểm tra like đã tồn tại hay chưa bằng repo
    const existingLike = await this.postLikesRepo.findByAccountAndPost(
      account.id,
      post.id
    )
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
  }

  async unLike(data: UnlikePostInputDTO): Promise<UnlikePostOutputDTO> {
    const post = await this.postRepo.getOneVisibleTo(
      data.postId,
      data.accountId
    )
    if (!post) throw new BadRequest()

    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new BadRequest()

    const existingLike = await this.postLikesRepo.findByAccountAndPost(
      account.id,
      post.id
    )
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
  }
}
