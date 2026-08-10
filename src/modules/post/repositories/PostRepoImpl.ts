import { Repository, SelectQueryBuilder } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Posts } from '~/entities/posts.entity'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import { visibleTo } from '~/modules/post/repositories/postVisibility'

export default class PostRepoImpl implements IPostRepo {
  private postRepo: Repository<Posts>

  constructor() {
    this.postRepo = mySqlDataSource.getRepository(Posts)
  }

  /**
   * Khung join dùng chung cho mọi luồng ĐỌC bài viết.
   *
   * Phải join tay postLike.account: quan hệ đó khai `eager: true` ở entity,
   * nhưng eager CHỈ có hiệu lực với find()/findOne() — createQueryBuilder thì
   * không. Bỏ sót join này thì postLikes[].account là undefined và tầng service
   * sẽ ném TypeError khi dựng AccountDTO.
   */
  private readQuery(): SelectQueryBuilder<Posts> {
    return this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.accounts', 'author')
      .leftJoinAndSelect('post.postMedias', 'postMedia')
      .leftJoinAndSelect('post.group', 'postGroup')
      .leftJoinAndSelect('post.postLikes', 'postLike')
      .leftJoinAndSelect('postLike.account', 'postLikeAccount')
  }

  async update(data: Posts): Promise<Posts | null> {
    const updatedPost = await this.postRepo.save(data)
    if (!updatedPost) {
      return null
    }
    return updatedPost
  }

  async getSuggestList(viewerId?: number): Promise<Posts[]> {
    return (
      this.readQuery()
        .where(visibleTo(viewerId))
        .orderBy('post.createdAt', 'DESC')
        // take() chứ không phải limit(): query có join 1-n nên limit() sẽ cắt
        // theo số HÀNG thô, làm một bài bị mất bớt media/like hoặc trả về ít
        // hơn 10 bài. take() để TypeORM tự tách thành truy vấn hai bước.
        .take(10)
        .getMany()
    )
  }

  async getAll(data: GetPostListInputDTO): Promise<Posts[]> {
    const { content, groupId, viewerId } = data
    const query = this.readQuery().where(visibleTo(viewerId))

    if (content) {
      // LIKE chứ không phải ILike: MySQL không có toán tử ILIKE, và collation
      // mặc định của MySQL vốn đã không phân biệt hoa thường.
      query.andWhere('post.content LIKE :content', { content: `%${content}%` })
    }
    if (groupId) {
      query.andWhere('postGroup.id = :groupId', { groupId })
    }

    return query.orderBy('post.createdAt', 'DESC').getMany()
  }

  /**
   * Nạp bài theo id KHÔNG lọc quyền riêng tư.
   *
   * Cố ý giữ nguyên hành vi này vì đây là hàm nạp nội bộ, đang được dùng bởi:
   *   - requireOwnership ở post.route.ts (phải nạp được bài để so chủ sở hữu)
   *   - luồng kiểm duyệt của staff có quyền post:delete
   *   - CommentService, like/unlike, update
   * Nếu lọc ở đây thì MODERATOR sẽ nhận 404 khi xoá một bài PRIVATE bị báo cáo.
   *
   * Route đọc công khai phải dùng getOneVisibleTo() thay cho hàm này.
   */
  async getOne(id): Promise<Posts | null> {
    const post = await this.postRepo.findOne({
      where: {
        id: id
      },
      relations: {
        accounts: true,
        postMedias: true,
        group: true,
        postLikes: true,
        comments: true
      }
    })
    if (!post) {
      return null
    }
    return post
  }

  /** Bản có lọc quyền riêng tư của getOne — dùng cho GET /v1/posts/:id */
  async getOneVisibleTo(id: number, viewerId?: number): Promise<Posts | null> {
    return this.readQuery()
      .where('post.id = :id', { id })
      .andWhere(visibleTo(viewerId))
      .getOne()
  }

  async getByAccountId(id: number, viewerId?: number): Promise<Posts[]> {
    return this.readQuery()
      .where('author.id = :authorId', { authorId: id })
      .andWhere(visibleTo(viewerId))
      .orderBy('post.createdAt', 'DESC')
      .getMany()
  }

  async create(data: Posts): Promise<Posts | null> {
    const post = await this.postRepo.save(data)
    if (!post) {
      return null
    }
    return post
  }

  async delete(id: number): Promise<Posts | null> {
    const post = await this.postRepo.findOne({ where: { id } })
    if (!post) {
      return null
    }
    await this.postRepo.delete(id)
    return post
  }
}
