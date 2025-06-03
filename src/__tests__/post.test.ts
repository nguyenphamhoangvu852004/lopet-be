/* eslint-disable @typescript-eslint/no-explicit-any */
import PostServiceImpl from '~/modules/post/services/PostServiceImpl'
import { BadRequest, Forbidden } from '~/error/error.custom'
import { Posts, POSTSCOPE } from '~/entities/posts.entity'
import { CreatePostInputDTO, PostMediaInputDTO } from '~/modules/post/dto/Create'
import { MEDIATYPE, PostMedias } from '~/entities/postMedias.entity'
import { UpdatePostInputDTO } from '~/modules/post/dto/Update'
import { Accounts } from '~/entities/accounts.entity'
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn()
    }
  }
}))

jest.mock('~/config/appDataSource', () => ({
  redis: {
    connect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn()
  },
  mySqlDataSource: {}
}))
jest.mock('~/utils/handle.util', () => ({
  handleThrowError: jest.fn((e) => {
    throw e
  })
}))

describe('PostServiceImpl - create', () => {
  const mockAccountRepo = { findById: jest.fn() }
  const mockGroupRepo = { findById: jest.fn() }
  const mockPostRepo = { create: jest.fn() }
  const mockPostMediaRepo = { create: jest.fn() }
  const mockPostLikeRepo = { create: jest.fn() }
  const postService = new PostServiceImpl(
    mockPostRepo as any,
    mockAccountRepo as any,
    mockGroupRepo as any,
    mockPostMediaRepo as any,
    mockPostLikeRepo as any
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create post with media successfully', async () => {
    const mockAccount = { id: '1' }
    const mockGroup = { id: '8' }
    const mockPost = {
      id: '1',
      accounts: mockAccount,
      content: 'Test content',
      postType: 'TEXT',
      postScope: POSTSCOPE.PUBLIC,
      group: mockGroup
    }
    const mockPostMedia = {
      id: '1',
      mediaUrl: 'https://examplecloudinarytestmediaurl.com/xxx/nnn.jpg',
      mediaType: MEDIATYPE.IMAGE
    }

    mockAccountRepo.findById.mockResolvedValue(mockAccount)
    mockGroupRepo.findById.mockResolvedValue(mockGroup)
    mockPostRepo.create.mockResolvedValue(mockPost)
    mockPostMediaRepo.create.mockResolvedValue(mockPostMedia)

    const input = new CreatePostInputDTO({
      accountId: 1,
      groupId: 2,
      content: 'Test content',
      scope: 'PUBLIC',
      postMedias: [
        new PostMediaInputDTO({
          id: 1,
          mediaUrl: 'https://example.com/image.jpg',
          mediaType: 'IMAGE',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ]
    })
    const result = await postService.create(input)

    expect(result).toMatchObject({
      accountId: mockAccount.id,
      postId: mockPost.id,
      content: mockPost.content,
      postType: mockPost.postType,
      scope: POSTSCOPE.PUBLIC,
      groupId: mockGroup.id,
      postMedias: [
        {
          id: mockPostMedia.id,
          mediaUrl: mockPostMedia.mediaUrl,
          mediaType: mockPostMedia.mediaType
        }
      ]
    })

    expect(mockAccountRepo.findById).toHaveBeenCalledWith(1)
    expect(mockGroupRepo.findById).toHaveBeenCalledWith(2)
    expect(mockPostRepo.create).toHaveBeenCalled()
    expect(mockPostMediaRepo.create).toHaveBeenCalled()
  })

  test('should throw BadRequest if account is not found', async () => {
    mockAccountRepo.findById.mockResolvedValue(null)

    const input = new CreatePostInputDTO({
      accountId: 2,
      content: 'Some content',
      scope: 'PUBLIC',
      postMedias: []
    })
    await expect(postService.create(input)).rejects.toThrow(BadRequest)
  })

  test('should create post even if group not found', async () => {
    const mockAccount = { id: '1' }
    const mockPost = {
      id: '2',
      accounts: mockAccount,
      content: 'No group content',
      postType: 'TEXT',
      postScope: POSTSCOPE.FRIEND
    }

    mockAccountRepo.findById.mockResolvedValue(mockAccount)
    mockGroupRepo.findById.mockResolvedValue(null)
    mockPostRepo.create.mockResolvedValue(mockPost)
    mockPostMediaRepo.create.mockResolvedValue(null)

    const input = new CreatePostInputDTO({
      accountId: 1,
      content: 'No group content',
      scope: 'PUBLIC',
      postMedias: []
    })
    const result = await postService.create(input)
    expect(result.groupId).toBe(null)
  })
})

describe('PostServiceImpl - update', () => {
  let postService: PostServiceImpl
  const mockPostRepo = {
    getOne: jest.fn(),
    update: jest.fn()
  }

  const mockPostMediaRepo = {
    deleteNotIn: jest.fn(),
    getById: jest.fn(),
    create: jest.fn()
  }

  const account = new Accounts({
    id: 123,
    username: 'username',
    email: 'email'
  })
  beforeEach(() => {
    postService = new PostServiceImpl(mockPostRepo as any, {} as any, {} as any, mockPostMediaRepo as any, {} as any)

    jest.clearAllMocks()
  })

  it('should update post successfully', async () => {
    const input = new UpdatePostInputDTO({
      postId: 1,
      owner: 123,
      content: 'Updated content',
      scope: 'FRIEND',
      oldIdsMedia: [10],
      postMedias: [
        {
          id: 99,
          mediaUrl: 'https://image.com/new.jpg',
          mediaType: MEDIATYPE.IMAGE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    })

    const mockPost = new Posts({
      id: 1,
      content: 'Old content',
      postScope: POSTSCOPE.PUBLIC,
      accounts: account,
      group: null
    })

    const oldMedia = new PostMedias({
      id: 10,
      mediaUrl: 'https://old.com/1.jpg',
      mediaType: MEDIATYPE.IMAGE,
      post: mockPost
    })

    const newMedia = new PostMedias({
      id: 99,
      mediaUrl: 'https://image.com/new.jpg',
      mediaType: MEDIATYPE.IMAGE,
      post: mockPost
    })

    mockPostRepo.getOne.mockResolvedValue(mockPost)
    mockPostRepo.update.mockResolvedValue(mockPost)
    mockPostMediaRepo.deleteNotIn.mockResolvedValue(undefined)
    mockPostMediaRepo.getById.mockResolvedValue(oldMedia)
    mockPostMediaRepo.create.mockResolvedValue(newMedia)

    const result = await postService.update(input)

    expect(result.content).toBe('Updated content')
    expect(result.scope).toBe(POSTSCOPE.FRIEND)
    expect(result.postMedias).toHaveLength(2)
    expect((result.postMedias ?? []).map((m) => m.id)).toEqual([10, 99])
  })

  it('should throw if post not found', async () => {
    mockPostRepo.getOne.mockResolvedValue(null)
    const input = new UpdatePostInputDTO({ postId: 1, owner: 1, content: 'abc', scope: 'PUBLIC' })

    await expect(postService.update(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if not owner', async () => {
    const mockPost = new Posts({ id: 1, accounts: account })
    mockPostRepo.getOne.mockResolvedValue(mockPost)
    const input = new UpdatePostInputDTO({ postId: 1, owner: 1, content: 'abc', scope: 'PUBLIC' })

    await expect(postService.update(input)).rejects.toThrow(Forbidden)
  })

  it('should throw if media not found', async () => {
    const mockPost = new Posts({ id: 1, accounts: account })
    mockPostRepo.getOne.mockResolvedValue(mockPost)
    mockPostRepo.update.mockResolvedValue(mockPost)
    mockPostMediaRepo.getById.mockResolvedValue(null)

    const input = new UpdatePostInputDTO({
      postId: 1,
      owner: 123,
      content: 'abc',
      scope: 'PUBLIC',
      oldIdsMedia: [1]
    })

    await expect(postService.update(input)).rejects.toThrow(BadRequest)
  })
})
