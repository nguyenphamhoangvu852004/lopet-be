/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

export function setupSocket(io: Server) {
  // Middleware xác thực
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error'))

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
      if (typeof decoded !== 'object' || decoded === null || !('id' in decoded)) {
        return next(new Error('Invalid token payload'))
      }

      const payload = decoded as { id: number }
      socket.data.userId = payload.id
      return next()
    } catch (err) {
      return next(new Error('Invalid token'))
    }
  })

  // Xử lý khi client kết nối
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    console.log(`User ${userId} connected with socketId ${socket.id}`)

    socket.join(`user_${userId}`)

    socket.on('join room', (room: string) => {
      socket.join(room)
      console.log(`${socket.id} joined room ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`)
    })
  })
}
