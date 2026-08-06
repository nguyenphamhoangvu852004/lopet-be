/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { BadRequest } from "~/error/error.custom";

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new BadRequest("Authentication error"));
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      );

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        !("id" in decoded)
      ) {
        return next(new BadRequest("Invalid token payload"));
      }

      const payload = decoded as { id: number };

      socket.data.userId = payload.id;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log("Socket authentication failed: token expired");
        return next(new Error("TOKEN_EXPIRED"));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        console.log("Socket authentication failed: invalid token");
        return next(new Error("INVALID_TOKEN"));
      }

      console.error("Socket authentication error:", error);
      return next(new Error("AUTHENTICATION_ERROR"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    console.log(`User ${userId} connected with socketId ${socket.id}`);

    socket.join(`user_${userId}`);

    socket.on("join room", (room: string) => {
      socket.join(room);

      console.log(`${socket.id} joined room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}

export const socketIOMiddleware = (socketIO: Server) => {
  return (req: any, res: any, next: any) => {
    res.io = socketIO;
    next();
  };
};
