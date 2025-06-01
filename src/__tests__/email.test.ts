import { redis } from '~/config/appDataSource'
import EmailServiceImpl from '~/modules/email/services/EmailServiceImpl'
import { transporter } from '~/config/emailConfig'

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

jest.mock('~/config/emailConfig', () => ({
  transporter: {
    sendMail: jest.fn()
  }
}))

// jest.mock('~/utils/handle.util', () => ({
//   handleThrowError: jest.fn((err) => {
//     throw err
//   })
// }))

describe('send otp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should send otp to email', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue(null)
    ;(redis.set as jest.Mock).mockResolvedValue(true)
    ;(transporter.sendMail as jest.Mock).mockResolvedValue(true)

    const emailService = new EmailServiceImpl()

    await expect(emailService.sendOTP('nphv852004@gmail.com')).resolves.toBeUndefined()

    expect(redis.get).toHaveBeenCalledTimes(1)
    expect(redis.set).toHaveBeenCalledTimes(1)
    expect(transporter.sendMail).toHaveBeenCalledTimes(1)
  })
})
// expect(undefined).toBeUndefined()  // pass
// expect(null).toBeUndefined()       // fail
// expect(0).toBeUndefined()          // fail
// expect('hello').toBeUndefined()    // fail
describe('verify otp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should verify otp', async () => {
    ;(redis.get as jest.Mock).mockResolvedValue('123456')
    ;(redis.del as jest.Mock).mockResolvedValue(true)
    ;(redis.set as jest.Mock).mockResolvedValue(true)

    const emailService = new EmailServiceImpl()
    const data = { email: 'nphv852004@gmail.com', otp: '123456' }
    await expect(emailService.verify(data)).resolves.toBeUndefined()

    expect(redis.get).toHaveBeenCalledTimes(1)
    expect(redis.del).toHaveBeenCalledTimes(1)
    expect(redis.set).toHaveBeenCalledTimes(1)
  })
})
