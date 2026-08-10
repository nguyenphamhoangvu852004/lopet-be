/**
 * Kiểm thử TÍCH HỢP cho phía GHI của ma trận phân quyền: tạo bài, bình luận,
 * trả lời, thả tim, sửa scope.
 *
 * postVisibility.integration.test.ts đã phủ phía ĐỌC ở tầng repo (mệnh đề SQL).
 * File này chạy ở tầng SERVICE vì các quy tắc còn lại — "ai được đăng vào group
 * nào", "comment cha có thuộc đúng bài không" — không nằm trong câu query mà
 * nằm ở PostServiceImpl / CommentServiceImpl.
 *
 * Chạy trên MySQL thật, database riêng `lopet_authz_test`, tự tạo và tự xoá.
 * YÊU CẦU: MySQL của docker-compose đang chạy.
 */
import path from 'path'
import { DataSource } from 'typeorm'

const TEST_DB_NAME = 'lopet_authz_test'

const connection = {
  host: process.env.TEST_DB_HOST ?? '127.0.0.1',
  port: Number(process.env.TEST_DB_PORT ?? 3307),
  username: process.env.TEST_DB_USER ?? 'root',
  password: process.env.TEST_DB_PASSWORD ?? 'nguyenvu'
}

const mockDataSource = new DataSource({
  type: 'mysql',
  ...connection,
  database: TEST_DB_NAME,
  entities: [path.join(__dirname, '/../../../entities/*.entity.{ts,js}')],
  synchronize: true,
  logging: false
})

jest.mock('~/config/appDataSource', () => ({
  mySqlDataSource: mockDataSource,
  redis: { get: jest.fn(), set: jest.fn(), del: jest.fn(), getDel: jest.fn() }
}))

// Cloudinary bị nạp gián tiếp qua chuỗi import của service; mock để test không
// cần biến môi trường và không gọi ra mạng.
jest.mock('~/config/cloudinary', () => ({
  __esModule: true,
  default: { uploader: { upload: jest.fn() } }
}))

import { Accounts } from '~/entities/accounts.entity'
import { FriendShips, FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { GroupMembers, GROUPMEMBERROLE } from '~/entities/groupMembers.entity'
import { Groups, GROUPTYPE } from '~/entities/groups.entity'
import { POSTSCOPE } from '~/entities/posts.entity'
import { BadRequest, Forbidden, NotFound } from '~/error/error.custom'
import AccountRepoImpl from '~/modules/account/repositories/AccountRepoImpl'
import { CommentRepoImpl } from '~/modules/comment/repositories/CommentRepoImpl'
import { CommentServiceImpl } from '~/modules/comment/services/CommentServiceImpl'
import { CreateCommentInputDTO } from '~/modules/comment/dto/Create'
import GroupRepoImpl from '~/modules/group/repositories/GroupRepoImpl'
import { CreatePostInputDTO } from '~/modules/post/dto/Create'
import { LikePostInputDTO } from '~/modules/post/dto/React'
import { UpdatePostInputDTO } from '~/modules/post/dto/Update'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'
import PostLikeRepoImpl from '~/modules/postLike/repositories/PostLikeRepoImpl'
import { PostMediaRepositoriesImpl } from '~/modules/postMedia/repositories/PostMediaRepositoriesImpl'
import ProfileRepoImpl from '~/modules/profile/repositories/ProfileRepoImpl'

jest.setTimeout(60_000)

const actors = {
  author: 0,
  friend: 0,
  stranger: 0,
  groupMember: 0
}

const groups = {
  publicGroup: 0,
  privateGroup: 0
}

let postService: PostServiceImpl
let commentService: CommentServiceImpl

/** Tạo bài cá nhân của `author` với scope cho trước, trả về postId */
async function personalPost(scope: POSTSCOPE): Promise<number> {
  const created = await postService.create(
    new CreatePostInputDTO({
      accountId: actors.author,
      content: `personal-${scope}-${Date.now()}-${Math.random()}`,
      groupId: null as unknown as number,
      scope,
      postMedias: []
    })
  )
  return created.postId
}

/** Tạo bài trong group bởi `accountId`, trả về postId */
async function groupPost(groupId: number, accountId: number): Promise<number> {
  const created = await postService.create(
    new CreatePostInputDTO({
      accountId,
      content: `group-${groupId}-${Date.now()}-${Math.random()}`,
      groupId,
      scope: POSTSCOPE.PUBLIC,
      postMedias: []
    })
  )
  return created.postId
}

function comment(accountId: number, postId: number, replyTo?: number) {
  return commentService.create(
    new CreateCommentInputDTO({
      accountId,
      content: 'xin chao',
      imageUrl: '',
      replyCommentId: replyTo ?? null,
      postId
    })
  )
}

async function createDatabase() {
  const bootstrap = new DataSource({
    type: 'mysql',
    ...connection,
    database: 'mysql'
  })
  await bootstrap.initialize()
  await bootstrap.query(`DROP DATABASE IF EXISTS \`${TEST_DB_NAME}\``)
  await bootstrap.query(`CREATE DATABASE \`${TEST_DB_NAME}\``)
  await bootstrap.destroy()
}

async function seed() {
  const accountRepo = mockDataSource.getRepository(Accounts)
  const groupRepo = mockDataSource.getRepository(Groups)
  const memberRepo = mockDataSource.getRepository(GroupMembers)
  const friendRepo = mockDataSource.getRepository(FriendShips)

  const mkAccount = async (name: string) =>
    accountRepo.save(
      new Accounts({
        email: `${name}@authz.local`,
        username: name,
        password: 'x',
        isBanned: 0
      })
    )

  const author = await mkAccount('author')
  const friend = await mkAccount('friend')
  const stranger = await mkAccount('stranger')
  const groupMember = await mkAccount('groupmember')

  actors.author = author.id
  actors.friend = friend.id
  actors.stranger = stranger.id
  actors.groupMember = groupMember.id

  await friendRepo.save(
    new FriendShips({
      sender: author,
      receiver: friend,
      status: FRIENDSHIPSTATUS.ACCEPTED
    })
  )
  // Lời mời PENDING — cố ý để chứng minh nó KHÔNG được tính là bạn bè
  await friendRepo.save(
    new FriendShips({
      sender: stranger,
      receiver: author,
      status: FRIENDSHIPSTATUS.PENDING
    })
  )

  const publicGroup = await groupRepo.save(
    new Groups({ name: 'nhom-cong-khai', type: GROUPTYPE.PUBLIC, coverUrl: '' })
  )
  const privateGroup = await groupRepo.save(
    new Groups({ name: 'nhom-rieng-tu', type: GROUPTYPE.PRIVATE, coverUrl: '' })
  )
  groups.publicGroup = publicGroup.id
  groups.privateGroup = privateGroup.id

  for (const group of [publicGroup, privateGroup]) {
    await memberRepo.save(
      new GroupMembers({
        groupId: group.id,
        accountId: groupMember.id,
        role: GROUPMEMBERROLE.MEMBER,
        joinedAt: new Date()
      })
    )
  }
}

beforeAll(async () => {
  await createDatabase()
  await mockDataSource.initialize()
  await seed()

  const postRepo = new PostRepoImpl()
  const accountRepo = new AccountRepoImpl()
  const groupRepo = new GroupRepoImpl()
  const postMediaRepo = new PostMediaRepositoriesImpl()
  const postLikeRepo = new PostLikeRepoImpl()
  postService = new PostServiceImpl(
    postRepo,
    accountRepo,
    groupRepo,
    postMediaRepo,
    postLikeRepo
  )
  commentService = new CommentServiceImpl(
    new CommentRepoImpl(),
    accountRepo,
    postRepo,
    new ProfileRepoImpl()
  )
})

afterAll(async () => {
  if (mockDataSource.isInitialized) {
    await mockDataSource.query(`DROP DATABASE IF EXISTS \`${TEST_DB_NAME}\``)
    await mockDataSource.destroy()
  }
})

describe('Tạo bài trong group — nhóm PUBLIC mở cho tất cả', () => {
  it('người ngoài nhóm vẫn đăng được bài vào nhóm PUBLIC', async () => {
    const postId = await groupPost(groups.publicGroup, actors.stranger)
    expect(postId).toBeGreaterThan(0)
  })

  it('bài trong nhóm PUBLIC đọc được bởi cả khách vãng lai', async () => {
    const postId = await groupPost(groups.publicGroup, actors.stranger)
    await expect(postService.getOneById(postId, undefined)).resolves.toBeTruthy()
  })
})

describe('Tạo bài trong group — nhóm PRIVATE chỉ cho thành viên', () => {
  it('thành viên đăng được', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    expect(postId).toBeGreaterThan(0)
  })

  it('người ngoài nhóm KHÔNG đăng được — đây là lỗ hổng cũ', async () => {
    // Trước bản vá, create() chỉ nạp group rồi gắn vào bài mà không hỏi tư cách
    // thành viên, nên lệnh này thành công và bài hiện ra với cả nhóm.
    await expect(
      groupPost(groups.privateGroup, actors.stranger)
    ).rejects.toThrow(Forbidden)
  })

  it('bài của thành viên không lọt ra ngoài nhóm', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    await expect(postService.getOneById(postId, undefined)).rejects.toThrow(
      NotFound
    )
    await expect(
      postService.getOneById(postId, actors.stranger)
    ).rejects.toThrow(NotFound)
    await expect(
      postService.getOneById(postId, actors.groupMember)
    ).resolves.toBeTruthy()
  })

  it('groupId không tồn tại thì báo lỗi, không âm thầm thành bài cá nhân', async () => {
    // Hành vi cũ gán group = null, biến bài người dùng tưởng đang đăng trong
    // nhóm thành bài cá nhân PUBLIC — tức là đẩy nội dung ra ngoài.
    await expect(groupPost(999_999, actors.author)).rejects.toThrow(NotFound)
  })
})

describe('Ràng buộc scope khi tạo bài', () => {
  it('bài nhóm không nhận scope FRIEND', async () => {
    await expect(
      postService.create(
        new CreatePostInputDTO({
          accountId: actors.groupMember,
          content: 'scope sai',
          groupId: groups.publicGroup,
          scope: POSTSCOPE.FRIEND,
          postMedias: []
        })
      )
    ).rejects.toThrow(BadRequest)
  })

  it('bài cá nhân nhận đủ PUBLIC / FRIEND / PRIVATE', async () => {
    for (const scope of [
      POSTSCOPE.PUBLIC,
      POSTSCOPE.FRIEND,
      POSTSCOPE.PRIVATE
    ]) {
      await expect(personalPost(scope)).resolves.toBeGreaterThan(0)
    }
  })

  it('scope rác bị từ chối', async () => {
    await expect(
      personalPost('EVERYONE' as POSTSCOPE)
    ).rejects.toThrow(BadRequest)
  })
})

describe('Sửa bài — scope xét theo group thật, không theo body', () => {
  it('không đặt được scope FRIEND cho bài nhóm dù body bỏ trống groupId', async () => {
    const postId = await groupPost(groups.publicGroup, actors.groupMember)
    // Body không hề có groupId — trước bản vá controller sẽ coi đây là bài cá
    // nhân và cho phép FRIEND.
    await expect(
      postService.update(
        new UpdatePostInputDTO({
          postId,
          owner: actors.groupMember,
          content: 'sua noi dung',
          scope: POSTSCOPE.FRIEND,
          oldIdsMedia: [],
          postMedias: []
        })
      )
    ).rejects.toThrow(BadRequest)
  })

  it('người không sở hữu bài không sửa được', async () => {
    const postId = await personalPost(POSTSCOPE.PUBLIC)
    await expect(
      postService.update(
        new UpdatePostInputDTO({
          postId,
          owner: actors.stranger,
          content: 'cuop bai',
          scope: POSTSCOPE.PUBLIC,
          oldIdsMedia: [],
          postMedias: []
        })
      )
    ).rejects.toThrow(Forbidden)
  })
})

describe('Bình luận kế thừa quyền riêng tư của bài', () => {
  it('bài PUBLIC cá nhân — ai cũng bình luận được', async () => {
    const postId = await personalPost(POSTSCOPE.PUBLIC)
    await expect(comment(actors.stranger, postId)).resolves.toBeTruthy()
  })

  it('bài FRIEND — bạn bè ACCEPTED bình luận được, người lạ thì không', async () => {
    const postId = await personalPost(POSTSCOPE.FRIEND)
    await expect(comment(actors.friend, postId)).resolves.toBeTruthy()
    await expect(comment(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('lời mời PENDING không được tính là bạn bè', async () => {
    const postId = await personalPost(POSTSCOPE.FRIEND)
    // stranger có một FriendShips PENDING với author — vẫn phải bị chặn
    await expect(comment(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('bài PRIVATE — chỉ tác giả bình luận được', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    await expect(comment(actors.author, postId)).resolves.toBeTruthy()
    await expect(comment(actors.friend, postId)).rejects.toThrow(BadRequest)
    await expect(comment(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('bài trong nhóm PRIVATE — chỉ thành viên bình luận được', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    await expect(comment(actors.groupMember, postId)).resolves.toBeTruthy()
    await expect(comment(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('không đọc được danh sách bình luận của bài mình không xem được', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    await comment(actors.author, postId)

    await expect(
      commentService.getCommentAllFromPost(postId, actors.stranger)
    ).rejects.toThrow(BadRequest)
    await expect(
      commentService.getCommentAllFromPost(postId, undefined)
    ).rejects.toThrow(BadRequest)
    await expect(
      commentService.getCommentAllFromPost(postId, actors.author)
    ).resolves.toBeTruthy()
  })

  it('không đọc được bình luận của bài trong nhóm PRIVATE', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    await comment(actors.groupMember, postId)
    await expect(
      commentService.getCommentAllFromPost(postId, actors.stranger)
    ).rejects.toThrow(BadRequest)
  })
})

describe('Trả lời bình luận phải giải quyết qua bài cha', () => {
  it('trả lời trong cùng một bài thì được', async () => {
    const postId = await personalPost(POSTSCOPE.PUBLIC)
    const parent = await comment(actors.author, postId)
    await expect(
      comment(actors.stranger, postId, parent.commentId)
    ).resolves.toBeTruthy()
  })

  it('không ghép được comment cha của bài khác vào bài mình xem được', async () => {
    // Kịch bản tấn công: lấy replyCommentId từ một bài PRIVATE của người khác,
    // ghép với postId của một bài công khai mà mình xem được. Kiểm tra quyền
    // chạy trên bài công khai, nhưng comment cha lại nằm ở bài riêng tư.
    const privatePostId = await personalPost(POSTSCOPE.PRIVATE)
    const hiddenComment = await comment(actors.author, privatePostId)
    const publicPostId = await personalPost(POSTSCOPE.PUBLIC)

    await expect(
      comment(actors.stranger, publicPostId, hiddenComment.commentId)
    ).rejects.toThrow(BadRequest)
  })

  it('không trả lời được trực tiếp vào bài riêng tư', async () => {
    const privatePostId = await personalPost(POSTSCOPE.PRIVATE)
    const parent = await comment(actors.author, privatePostId)
    await expect(
      comment(actors.stranger, privatePostId, parent.commentId)
    ).rejects.toThrow(BadRequest)
  })
})

describe('Thả tim kế thừa quyền riêng tư của bài', () => {
  const like = (accountId: number, postId: number) =>
    postService.like(new LikePostInputDTO({ accountId, postId }))

  it('bài PUBLIC — ai cũng thả tim được', async () => {
    const postId = await personalPost(POSTSCOPE.PUBLIC)
    await expect(like(actors.stranger, postId)).resolves.toBeTruthy()
  })

  it('bài FRIEND — bạn bè được, người lạ không', async () => {
    const postId = await personalPost(POSTSCOPE.FRIEND)
    await expect(like(actors.friend, postId)).resolves.toBeTruthy()
    await expect(like(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('bài PRIVATE — chỉ tác giả', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    await expect(like(actors.author, postId)).resolves.toBeTruthy()
    await expect(like(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })

  it('bài trong nhóm PRIVATE — chỉ thành viên', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    await expect(like(actors.groupMember, postId)).resolves.toBeTruthy()
    await expect(like(actors.stranger, postId)).rejects.toThrow(BadRequest)
  })
})

describe('Sửa/xoá không được dùng làm công cụ dò sự tồn tại', () => {
  // Hai loader này là logic phân quyền thật (nằm ở post.route.ts /
  // comment.route.ts), nên kiểm trực tiếp hành vi của chúng: bài mình không
  // được xem phải nạp ra null để requireOwnership trả 404 thay vì 403.
  const postRepo = new PostRepoImpl()
  const commentRepo = new CommentRepoImpl()

  const loadPostFor = (postId: number, viewerId?: number) =>
    postRepo.getOneVisibleTo(postId, Number(viewerId))

  it('bài PRIVATE của người khác nạp ra null (=> 404, không phải 403)', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    await expect(loadPostFor(postId, actors.stranger)).resolves.toBeNull()
    // Chủ bài vẫn nạp được bình thường — bộ lọc không chặn nhầm người có quyền
    await expect(loadPostFor(postId, actors.author)).resolves.toBeTruthy()
  })

  it('bài PUBLIC của người khác vẫn nạp được (=> 403 đúng nghĩa)', async () => {
    const postId = await personalPost(POSTSCOPE.PUBLIC)
    const loaded = await loadPostFor(postId, actors.stranger)
    expect(loaded).toBeTruthy()
    // requireOwnership sẽ so chủ sở hữu và từ chối
    expect(loaded?.accounts.id).toBe(actors.author)
  })

  it('bài trong nhóm PRIVATE nạp ra null với người ngoài nhóm', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    await expect(loadPostFor(postId, actors.stranger)).resolves.toBeNull()
    await expect(loadPostFor(postId, actors.groupMember)).resolves.toBeTruthy()
  })

  it('bình luận trong bài PRIVATE không lộ sự tồn tại qua loader xoá', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    const created = await comment(actors.author, postId)

    const loaded = await commentRepo.findCommentById(created.commentId)
    // Quan hệ `post` phải được nạp — nếu thiếu thì loader không đối chiếu được
    expect(loaded?.post?.id).toBe(postId)

    // Người lạ: bài cha không xem được => loader trả null => 404
    await expect(
      loadPostFor(loaded!.post.id, actors.stranger)
    ).resolves.toBeNull()
    await expect(
      loadPostFor(loaded!.post.id, actors.author)
    ).resolves.toBeTruthy()
  })
})

describe('Chống đi vòng qua endpoint khác', () => {
  it('mọi luồng đọc đều che cùng một bài riêng tư', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)

    // getOneById (GET /v1/posts/:id)
    await expect(
      postService.getOneById(postId, actors.stranger)
    ).rejects.toThrow(NotFound)

    // getByAccountId (GET /v1/posts/accounts/:id) — vào thẳng trang tác giả
    const byAccount = await postService.getByAccountId(
      actors.author,
      actors.stranger
    )
    expect(byAccount.map((post) => post.postId)).not.toContain(postId)

    // getAll + getSuggestList (GET /v1/posts, /v1/posts/suggest)
    const all = await postService.getAll({ viewerId: actors.stranger } as never)
    expect(all.map((post) => post.postId)).not.toContain(postId)

    const suggest = await postService.getSuggestList(actors.stranger)
    expect(suggest.map((post) => post.postId)).not.toContain(postId)

    // getCommentAllFromPost (GET /v1/comments/:postId)
    await expect(
      commentService.getCommentAllFromPost(postId, actors.stranger)
    ).rejects.toThrow(BadRequest)
  })

  it('lọc theo groupId không mở được nhóm PRIVATE', async () => {
    const postId = await groupPost(groups.privateGroup, actors.groupMember)
    const all = await postService.getAll({
      viewerId: actors.stranger,
      groupId: groups.privateGroup
    } as never)
    expect(all.map((post) => post.postId)).not.toContain(postId)
  })

  it('tìm kiếm theo nội dung không lộ bài riêng tư', async () => {
    const postId = await personalPost(POSTSCOPE.PRIVATE)
    const all = await postService.getAll({
      viewerId: actors.stranger,
      content: 'personal-PRIVATE'
    } as never)
    expect(all.map((post) => post.postId)).not.toContain(postId)
  })
})
