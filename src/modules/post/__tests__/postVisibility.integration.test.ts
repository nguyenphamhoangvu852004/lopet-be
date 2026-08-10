/**
 * Kiểm thử TÍCH HỢP cho quyền riêng tư bài viết (postScope).
 *
 * Chạy trên MySQL thật, không mock repo: phần dễ sai nhất của bản vá là SQL —
 * subquery EXISTS, alias, và cách TypeORM dựng câu lệnh — mà mock thì không
 * kiểm được dòng nào trong đó.
 *
 * YÊU CẦU: MySQL của docker-compose đang chạy (make docker-up).
 * Test tự tạo và tự xoá database riêng `lopet_visibility_test`,
 * KHÔNG đụng tới database `socialmedia` của môi trường dev.
 *
 * Có thể trỏ sang máy khác qua TEST_DB_HOST / TEST_DB_PORT / TEST_DB_USER /
 * TEST_DB_PASSWORD.
 */
import path from 'path'
import { DataSource } from 'typeorm'

const TEST_DB_NAME = 'lopet_visibility_test'

const connection = {
  host: process.env.TEST_DB_HOST ?? '127.0.0.1',
  port: Number(process.env.TEST_DB_PORT ?? 3307),
  username: process.env.TEST_DB_USER ?? 'root',
  password: process.env.TEST_DB_PASSWORD ?? 'nguyenvu'
}

// Tiền tố `mock` là bắt buộc để jest cho phép factory bên dưới tham chiếu ra
// ngoài phạm vi (jest.mock được hoisted lên đầu file).
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

import { Accounts } from '~/entities/accounts.entity'
import { FriendShips, FRIENDSHIPSTATUS } from '~/entities/friendShips.entity'
import { GroupMembers, GROUPMEMBERROLE } from '~/entities/groupMembers.entity'
import { Groups, GROUPTYPE } from '~/entities/groups.entity'
import { Posts, POSTSCOPE, POSTTYPE } from '~/entities/posts.entity'
import PostRepoImpl from '~/modules/post/repositories/PostRepoImpl'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'

jest.setTimeout(60_000)

/** Các nhân vật trong kịch bản */
const actors = {
  author: 0,
  friend: 0,
  stranger: 0,
  groupMember: 0
}

/** Bài viết trong kịch bản, map từ tên dễ đọc -> id */
const posts: Record<string, number> = {}

let repo: PostRepoImpl

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
  const postRepo = mockDataSource.getRepository(Posts)

  const mkAccount = async (name: string) =>
    accountRepo.save(
      new Accounts({
        email: `${name}@test.local`,
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

  // author <-> friend đã là bạn; author <-> stranger thì chưa
  await friendRepo.save(
    new FriendShips({
      sender: author,
      receiver: friend,
      status: FRIENDSHIPSTATUS.ACCEPTED
    })
  )
  // Một lời mời PENDING không được tính là bạn bè
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

  const mkPost = async (
    key: string,
    scope: POSTSCOPE,
    group: Groups | null = null
  ) => {
    const entity = new Posts({
      accounts: author,
      content: key,
      group,
      postScope: scope,
      postType: group ? POSTTYPE.GROUP : POSTTYPE.USER
    })
    posts[key] = (await postRepo.save(entity)).id
  }

  await mkPost('userPublic', POSTSCOPE.PUBLIC)
  await mkPost('userFriend', POSTSCOPE.FRIEND)
  await mkPost('userPrivate', POSTSCOPE.PRIVATE)
  await mkPost('pubGroupPublic', POSTSCOPE.PUBLIC, publicGroup)
  await mkPost('pubGroupPrivate', POSTSCOPE.PRIVATE, publicGroup)
  await mkPost('privGroupPublic', POSTSCOPE.PUBLIC, privateGroup)
}

/** Tên các bài mà viewer đọc được qua getAll, đã sắp xếp để so sánh ổn định */
async function visibleKeys(viewerId?: number): Promise<string[]> {
  const list = await repo.getAll(new GetPostListInputDTO({ viewerId }))
  return list.map((post) => post.content).sort()
}

beforeAll(async () => {
  await createDatabase()
  await mockDataSource.initialize()
  await seed()
  // Khởi tạo SAU initialize vì constructor gọi getRepository()
  repo = new PostRepoImpl()
})

afterAll(async () => {
  if (mockDataSource.isInitialized) {
    await mockDataSource.query(`DROP DATABASE IF EXISTS \`${TEST_DB_NAME}\``)
    await mockDataSource.destroy()
  }
})

describe('Quyền riêng tư bài viết — getAll', () => {
  it('khách chưa đăng nhập chỉ thấy nội dung thực sự công khai', async () => {
    // Đây chính là lỗ hổng cũ: trước bản vá lệnh này trả về CẢ 6 bài,
    // gồm userPrivate và userFriend của người lạ.
    await expect(visibleKeys(undefined)).resolves.toEqual([
      'pubGroupPublic',
      'userPublic'
    ])
  })

  it('người lạ đã đăng nhập không thấy bài FRIEND hay PRIVATE', async () => {
    await expect(visibleKeys(actors.stranger)).resolves.toEqual([
      'pubGroupPublic',
      'userPublic'
    ])
  })

  it('bạn bè ACCEPTED thấy thêm bài scope FRIEND, nhưng không thấy PRIVATE', async () => {
    await expect(visibleKeys(actors.friend)).resolves.toEqual([
      'pubGroupPublic',
      'userFriend',
      'userPublic'
    ])
  })

  it('tác giả thấy mọi bài của chính mình, kể cả PRIVATE', async () => {
    await expect(visibleKeys(actors.author)).resolves.toEqual([
      'privGroupPublic',
      'pubGroupPrivate',
      'pubGroupPublic',
      'userFriend',
      'userPrivate',
      'userPublic'
    ])
  })

  it('thành viên nhóm thấy bài trong nhóm mình, kể cả nhóm PRIVATE', async () => {
    await expect(visibleKeys(actors.groupMember)).resolves.toEqual([
      'privGroupPublic',
      'pubGroupPrivate',
      'pubGroupPublic',
      'userPublic'
    ])
  })

  it('bài trong nhóm PRIVATE không lọt ra ngoài dù scope là PUBLIC', async () => {
    const forStranger = await visibleKeys(actors.stranger)
    expect(forStranger).not.toContain('privGroupPublic')
  })
})

describe('Quyền riêng tư bài viết — getOneVisibleTo', () => {
  it('trả null cho bài PRIVATE khi người xem là khách', async () => {
    await expect(
      repo.getOneVisibleTo(posts.userPrivate, undefined)
    ).resolves.toBeNull()
  })

  it('trả null cho bài FRIEND khi người xem không phải bạn', async () => {
    await expect(
      repo.getOneVisibleTo(posts.userFriend, actors.stranger)
    ).resolves.toBeNull()
  })

  it('trả về bài FRIEND cho đúng bạn bè', async () => {
    const post = await repo.getOneVisibleTo(posts.userFriend, actors.friend)
    expect(post?.content).toBe('userFriend')
  })

  it('trả về bài PRIVATE cho chính tác giả', async () => {
    const post = await repo.getOneVisibleTo(posts.userPrivate, actors.author)
    expect(post?.content).toBe('userPrivate')
  })

  it('vẫn nạp kèm tác giả và danh sách like (eager không áp cho QueryBuilder)', async () => {
    const post = await repo.getOneVisibleTo(posts.userPublic, undefined)
    // Nếu quên join tay postLike.account thì tầng service sẽ ném TypeError
    expect(post?.accounts?.id).toBe(actors.author)
    expect(Array.isArray(post?.postLikes)).toBe(true)
  })
})

describe('Quyền riêng tư bài viết — getSuggestList / getByAccountId', () => {
  it('getSuggestList lọc theo đúng người xem', async () => {
    const anonymous = await repo.getSuggestList(undefined)
    expect(anonymous.map((post) => post.content).sort()).toEqual([
      'pubGroupPublic',
      'userPublic'
    ])
  })

  it('getByAccountId không lộ bài riêng tư của người khác', async () => {
    const seenByStranger = await repo.getByAccountId(
      actors.author,
      actors.stranger
    )
    expect(seenByStranger.map((post) => post.content).sort()).toEqual([
      'pubGroupPublic',
      'userPublic'
    ])

    const seenByAuthor = await repo.getByAccountId(
      actors.author,
      actors.author
    )
    expect(seenByAuthor.length).toBe(6)
  })
})
