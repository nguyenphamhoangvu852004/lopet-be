jest.mock('~/config/appDataSource', () => ({
  redis: {
    get: jest.fn(),
    del: jest.fn(),
    set: jest.fn(),
    connect: jest.fn()
  }
}))
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import AuthServiceImpl from '~/modules/auth/services/AuthServiceImpl'
import { RegisterInputDTO } from '~/modules/auth/dto/Register'
import { redis } from '~/config/appDataSource'
describe('create an account', () => {
  let authService: AuthServiceImpl
  let mockRepo: jest.Mocked<IAccountRepo>

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn()
    } as any
    authService = new AuthServiceImpl(mockRepo)
  })

  it('should register successfully when email is verified', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue('true')
    ;(redis.del as jest.Mock).mockResolvedValue(1)
    mockRepo.findByEmail.mockResolvedValue(null)
    mockRepo.create.mockResolvedValue({
      id: 1,
      advertisements: [],
      email: 'test@mail.com',
      username: 'testuser',
      comments: [],
      createdAt: new Date(),
      deletedAt: null,
      isBanned: 0,
      groups: [],
      memberGroups: [],
      password: 'dsaklfja',
      postlikes: [],
      posts: [],
      profile: null,
      receivedFriendRequests: [],
      reports: [],
      roles: [],
      sentFriendRequests: [],
      updatedAt: new Date()
    })

    const input = new RegisterInputDTO({
      email: 'test@mail.com',
      username: 'testuser',
      password: '123456',
      confirmPassword: '123456'
    })

    const result = await authService.register(input)

    expect(result.email).toBe('test@mail.com')
    expect(mockRepo.findByEmail).toBeCalledWith('test@mail.com')
    expect(redis.del).toBeCalledWith('email_verified:test@mail.com')
  })
})
