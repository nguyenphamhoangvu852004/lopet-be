/* eslint-disable @typescript-eslint/no-explicit-any */
import { Comments } from '~/entities/comments.entity'
import { BadRequest } from '~/error/error.custom'
import { CreateCommentInputDTO, CreateCommentOutputDTO } from '~/modules/comment/dto/Create'
import { DeleteCommentInputDTO, DeleteCommentOutputDTO } from '~/modules/comment/dto/Delete'
import { CommentServiceImpl } from '~/modules/comment/services/CommentServiceImpl'

describe('CommentServiceImpl.create', () => {
  let commentService: CommentServiceImpl
  const mockAccountRepo = {
    findById: jest.fn()
  }
  const mockPostRepo = {
    getOne: jest.fn()
  }
  const mockCommentRepo = {
    findCommentById: jest.fn(),
    create: jest.fn()
  }

  beforeEach(() => {
    commentService = new CommentServiceImpl(
      mockCommentRepo as any,
      mockAccountRepo as any,
      mockPostRepo as any,
      {} as any
    )
    jest.clearAllMocks()
  })

  it('should create comment successfully (no reply)', async () => {
    const input = new CreateCommentInputDTO({
      postId: 1,
      accountId: 123,
      content: 'Test comment',
      imageUrl: ''
    })

    const mockAccount = { id: 123 }
    const mockPost = { id: 1 }
    const mockComment = new Comments({ id: 10 })

    mockAccountRepo.findById.mockResolvedValue(mockAccount)
    mockPostRepo.getOne.mockResolvedValue(mockPost)
    mockCommentRepo.create.mockResolvedValue(mockComment)

    const result = await commentService.create(input)

    expect(result).toBeInstanceOf(CreateCommentOutputDTO)
    expect(result.commentId).toBe(10)
  })

  it('should create reply comment successfully', async () => {
    const input = new CreateCommentInputDTO({
      postId: 1,
      accountId: 123,
      content: 'Replying...',
      replyCommentId: 5
    })

    const mockAccount = { id: 123 }
    const mockPost = { id: 1 }
    const mockParentComment = { id: 5 }
    const mockCreatedComment = new Comments({ id: 999 })

    mockAccountRepo.findById.mockResolvedValue(mockAccount)
    mockPostRepo.getOne.mockResolvedValue(mockPost)
    mockCommentRepo.findCommentById.mockResolvedValue(mockParentComment)
    mockCommentRepo.create.mockResolvedValue(mockCreatedComment)

    const result = await commentService.create(input)

    expect(result.commentId).toBe(999)
    expect(mockCommentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: mockParentComment,
        text: 'Replying...'
      })
    )
  })

  it('should throw if account not found', async () => {
    mockAccountRepo.findById.mockResolvedValue(null)

    const input = new CreateCommentInputDTO({
      postId: 1,
      accountId: 123,
      content: 'Test'
    })

    await expect(commentService.create(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if post not found', async () => {
    mockAccountRepo.findById.mockResolvedValue({ id: 123 })
    mockPostRepo.getOne.mockResolvedValue(null)

    const input = new CreateCommentInputDTO({
      postId: 1,
      accountId: 123,
      content: 'Test'
    })

    await expect(commentService.create(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if reply comment not found', async () => {
    mockAccountRepo.findById.mockResolvedValue({ id: 123 })
    mockPostRepo.getOne.mockResolvedValue({ id: 1 })
    mockCommentRepo.findCommentById.mockResolvedValue(null)

    const input = new CreateCommentInputDTO({
      postId: 1,
      accountId: 123,
      content: 'Reply',
      replyCommentId: 999
    })

    await expect(commentService.create(input)).rejects.toThrow(BadRequest)
  })
})

describe('CommentServiceImpl - delete', () => {
  let commentService: CommentServiceImpl

  const mockCommentRepo = {
    findCommentById: jest.fn(),
    delete: jest.fn()
  }

  const mockAccountRepo = {
    findById: jest.fn()
  }

  beforeEach(() => {
    commentService = new CommentServiceImpl(
      mockCommentRepo as any,
      mockAccountRepo as any,
      {} as any, // postRepo không cần dùng ở đây
      {} as any
    )
    jest.clearAllMocks()
  })

  it('should delete comment successfully', async () => {
    const input = new DeleteCommentInputDTO({
      commentId: 100,
      owner: 123
    })

    const mockAccount = { id: 123 }
    const mockComment = {
      id: 100,
      account: { id: 123 }
    }

    mockCommentRepo.findCommentById.mockResolvedValue(mockComment)
    mockAccountRepo.findById.mockResolvedValue(mockAccount)
    mockCommentRepo.delete.mockResolvedValue({ id: 100 })

    const result = await commentService.delete(input)

    expect(result).toBeInstanceOf(DeleteCommentOutputDTO)
    expect(result.commentId).toBe(100)
    expect(mockCommentRepo.delete).toHaveBeenCalledWith(100)
  })

  it('should throw if comment not found', async () => {
    mockCommentRepo.findCommentById.mockResolvedValue(null)

    const input = new DeleteCommentInputDTO({
      commentId: 100,
      owner: 123
    })

    await expect(commentService.delete(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if account not found', async () => {
    mockCommentRepo.findCommentById.mockResolvedValue({
      id: 100,
      account: { id: 123 }
    })
    mockAccountRepo.findById.mockResolvedValue(null)

    const input = new DeleteCommentInputDTO({
      commentId: 100,
      owner: 123
    })

    await expect(commentService.delete(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if user is not the owner of the comment', async () => {
    const input = new DeleteCommentInputDTO({
      commentId: 100,
      owner: 999
    })

    const mockComment = {
      id: 100,
      account: { id: 123 }
    }

    mockCommentRepo.findCommentById.mockResolvedValue(mockComment)
    mockAccountRepo.findById.mockResolvedValue({ id: 999 })

    await expect(commentService.delete(input)).rejects.toThrow(BadRequest)
  })

  it('should throw if delete fails', async () => {
    const input = new DeleteCommentInputDTO({
      commentId: 100,
      owner: 123
    })

    const mockComment = {
      id: 100,
      account: { id: 123 }
    }

    mockCommentRepo.findCommentById.mockResolvedValue(mockComment)
    mockAccountRepo.findById.mockResolvedValue({ id: 123 })
    mockCommentRepo.delete.mockResolvedValue(null)

    await expect(commentService.delete(input)).rejects.toThrow(BadRequest)
  })
})
