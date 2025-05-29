import multer, { StorageEngine } from 'multer'

import { Request } from 'express'

const multerConfig: StorageEngine = multer.diskStorage({
  filename: function (req: Request, file: Express.Multer.File, callback) {
    callback(null, file.originalname)
  }
  // destination: function (req: Request, file: Express.Multer.File, callback) {
  //   callback(null, 'uploads')
  // }
})

export const upload: multer.Multer = multer({ storage: multerConfig })
