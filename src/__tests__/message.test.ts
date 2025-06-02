/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGESTATUS } from '~/entities/messages.entity'
import { CreateMessageInputDTO } from '~/modules/message/dto/CreateMessageDTO'
import MessageServiceImpl from '~/modules/message/services/MessageServiceImpl'

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

describe('MessageService - Create', () => {
  const messageRepoImpl = {
    getListMessage: jest.fn(),
    changeStatus: jest.fn(),
    create: jest.fn()
  }
  const accountRepoImpl = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn()
  }
  const profileRepoImpl = {
    findById: jest.fn(),
    findByAccountId: jest.fn()
  }
  let messageService: MessageServiceImpl
  beforeEach(() => {
    jest.clearAllMocks()
    messageService = new MessageServiceImpl(messageRepoImpl as any, accountRepoImpl as any, profileRepoImpl as any)
  })

  it('should create message successfully', async () => {
    const input = new CreateMessageInputDTO({
      senderId: '1',
      receiverId: '2',
      content: 'test content',
      imageUrl: 'linkhehe.hehe'
    })

    const sender = { id: 1 }
    const receiver = { id: 2 }
    const createdMessage = { id: 999 }

    accountRepoImpl.findById
      .mockResolvedValueOnce(sender) // ✅ đúng thứ tự
      .mockResolvedValueOnce(receiver)

    messageRepoImpl.create.mockResolvedValue(createdMessage)

    const result = await messageService.createMessage(input)

    expect(accountRepoImpl.findById).toHaveBeenCalledWith(1)
    expect(accountRepoImpl.findById).toHaveBeenCalledWith(2)
    expect(messageRepoImpl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'test content',
        sender,
        receiver,
        mediaUrl: 'linkhehe.hehe',
        status: MESSAGESTATUS.SENT
      })
    )

    expect(result).toEqual(
      expect.objectContaining({
        content: 'test content',
        senderId: '1',
        receiverId: '2',
        imageUrl: 'linkhehe.hehe'
      })
    )
  })
})
