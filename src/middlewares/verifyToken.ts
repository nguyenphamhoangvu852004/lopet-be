import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { log } from "console";
import { environment } from "~/config/env";
import { BadRequest } from "~/error/error.custom";
import { UserPayload } from "~/utils/jwt.util";

export function verifyToken() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        throw new BadRequest("Token not found");
      }

      // lấy trong payload ra
      const decoded = jwt.verify(
        token,
        environment.ACCESS_TOKEN_SECRET as string,
      );
      log("decoded", decoded);
      if (typeof decoded == "string") {
        throw new BadRequest("Token not found");
      }

      const userPayload: UserPayload = {
        id: decoded.id,
        email: decoded.email,
        roles: [],
      };
      req.user = userPayload;

      next();
    } catch (error) {
      next(error);
    }
  };
}
