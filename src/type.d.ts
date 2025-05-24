// src/types/express/index.d.ts
import { UserPayload } from '../path-to-your-UserPayload-definition'

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload
  }
}
