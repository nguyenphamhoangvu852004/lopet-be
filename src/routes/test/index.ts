import { Request, Response, Router } from 'express'
import core from 'express-serve-static-core'
import cloudinary from '~/config/cloudinary'
import { logger } from '~/config/logger'
import { upload } from '~/config/multerConfig'
export const testRouter: core.Router = Router()
testRouter.post('/upload', upload.single('image'), function (req: Request, res: Response): void {
  if (req.file == undefined) {
    logger.info(req.file)
    res.send({
      message: 'Please upload a file'
    })
    return
  }
  logger.info(req.file)
  cloudinary.uploader.upload(req.file.path, function (error, result) {
    if (error) {
      res.json(error)
      return
    } else {
      res.json(result)
      // lấy cái URL đó lưu vào database
      return
    }
  })
})

testRouter.post('/multi-upload', upload.array('images', 5), function (req: Request, res: Response): void {
  //   if (req.file == undefined) {
  //     res.send({
  //       message: 'Please upload a file'
  //     })
  //     return
  //   }
  //   logger.info(req.file)
  //   cloudinary.uploader.upload(req.file.path, function (error, result) {
  //     if (error) {
  //       res.json(error)
  //       return
  //     } else {
  //       res.json(result)
  //       return
  //     }
  //   })
})
// async function deleteImages(res: Response, files: Express.Multer.File[]) {
//   try {
//     for (const file of files) {
//       await cloudinary.uploader.destroy(file)
//     }
//   } catch (error) {
//     handleControllerError(error, res)
//   }
// }
testRouter.delete('/upload/:id', upload.single('image'), function (req: Request, res: Response): void {
  const { id } = req.params
  logger.info('Dang Xoa', id)
  cloudinary.uploader.destroy(id, function (error, result) {
    if (error) {
      res.json(error)
      return
    } else {
      res.json(result)
      return
    }
  })
})
