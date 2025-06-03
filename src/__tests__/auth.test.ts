/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleThrowError } from '~/utils/handle.util'
import { generateAccessToken, generateRefreshToken } from '~/utils/jwt.util'
import AuthServiceImpl from '~/modules/auth/services/AuthServiceImpl'
import { LoginInputDTO } from '~/modules/auth/dto/Login'
import { comparePassword, hashPassword } from '~/utils/bcryptjs.util'
import { BadRequest, Conflict, Forbidden, NotFound } from '~/error/error.custom'
import { redis } from '~/config/appDataSource'

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
jest.mock('~/utils/bcryptjs.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}))

jest.mock('~/utils/jwt.util', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn()
}))

jest.mock('~/utils/handle.util', () => ({
  handleThrowError: jest.fn((e) => {
    throw e
  })
}))

describe('Login account', () => {
  const mockAccountRepo = {
    findByUsername: jest.fn()
  }

  const authService = new AuthServiceImpl(mockAccountRepo as any)
  const inputDTO = new LoginInputDTO({
    username: 'nphv',
    password: '123456'
  })

  const mockAccount = {
    id: '1',
    email: 'test@example.com',
    username: 'nphv',
    password: 'hashedpassword',
    isBanned: 0,
    roles: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should login successfully with correct credentials', async () => {
    mockAccountRepo.findByUsername.mockResolvedValue(mockAccount)
    ;(comparePassword as jest.Mock).mockResolvedValue(true)
    ;(generateAccessToken as jest.Mock).mockReturnValue('access-token')
    ;(generateRefreshToken as jest.Mock).mockReturnValue('refresh-token')

    const result = await authService.login(inputDTO)

    expect(result).toEqual({
      id: mockAccount.id,
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })

    expect(mockAccountRepo.findByUsername).toHaveBeenCalledWith('nphv')
    expect(comparePassword).toHaveBeenCalledWith('123456', mockAccount.password)
    expect(generateAccessToken).toHaveBeenCalled()
    expect(generateRefreshToken).toHaveBeenCalled()
  })

  test('Should throw NotFound when account does not exist', async () => {
    mockAccountRepo.findByUsername.mockResolvedValue(null)
    await expect(authService.login(inputDTO)).rejects.toThrow(NotFound)
    expect(handleThrowError).toHaveBeenCalled()
  })

  test('Should throw Forbidden when account is banned', async () => {
    mockAccountRepo.findByUsername.mockResolvedValue({ ...mockAccount, isBanned: 1 })
    await expect(authService.login(inputDTO)).rejects.toThrow(Forbidden)
    expect(handleThrowError).toHaveBeenCalled()
  })

  test('Should throw BadRequest when password is incorrect', async () => {
    mockAccountRepo.findByUsername.mockResolvedValue(mockAccount)
    ;(comparePassword as jest.Mock).mockResolvedValue(false)
    await expect(authService.login(inputDTO)).rejects.toThrow(BadRequest)
    expect(handleThrowError).toHaveBeenCalled()
  })
})

describe('Register account', () => {
  const mockAccountRepo = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn()
  }
  const authService = new AuthServiceImpl(mockAccountRepo as any)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should throw BadRequest if email is not verified', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue(null)
    const input = {
      email: 'nphv82004@gmail.com',
      username: 'nphv852004',
      password: '654321',
      confirmPassword: '654321'
    }
    await expect(authService.register(input)).rejects.toThrow(BadRequest)
  })

  test('should throw Conflict if email already exists', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue('true')
    ;(redis.del as jest.Mock).mockResolvedValue(true)
    mockAccountRepo.findByEmail.mockResolvedValue({ email: 'nphv82004@gmail.com' })
    const input = {
      email: 'nphv82004@gmail.com',
      username: 'nphv852004',
      password: '654321',
      confirmPassword: '654321'
    }
    await expect(authService.register(input)).rejects.toThrow(Conflict)
  })

  test('should throw BadRequest if password confirmation fails', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue('true')
    ;(redis.del as jest.Mock).mockResolvedValue(true)
    mockAccountRepo.findByEmail.mockResolvedValue(null)
    mockAccountRepo.findByUsername.mockResolvedValue(null)
    const input = {
      email: 'nphv82004@gmail.com',
      username: 'nphv852004',
      password: '654321',
      confirmPassword: '6543210'
    }
    await expect(authService.register(input)).rejects.toThrow(BadRequest)
  })

  test('should create account successfully', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue('true')
    ;(redis.del as jest.Mock).mockResolvedValue(true)
    mockAccountRepo.findByEmail.mockResolvedValue(null)
    mockAccountRepo.findByUsername.mockResolvedValue(null)
    ;(hashPassword as jest.Mock).mockResolvedValue('hashedpassword')
    mockAccountRepo.create.mockResolvedValue({
      id: '1',
      email: 'nphv852004@gmail.com',
      username: 'nphv852004'
    })

    const input = {
      email: 'nphv852004@gmail.com',
      username: 'nphv852004',
      password: '654321',
      confirmPassword: '654321'
    }
    const result = await authService.register(input)
    expect(result.email).toBe(input.email)
    expect(result.username).toBe(input.username)
    expect(mockAccountRepo.create).toHaveBeenCalled()
  })
})
