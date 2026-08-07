import { NextFunction, Request, Response } from 'express'
import { ADVERTISERSTATUS } from '~/entities/advertiserProfiles.entity'
import { Forbidden } from '~/error/error.custom'
import IAdvertiserProfileRepo from '~/modules/advertiser/repositories/IAdvertiserProfileRepo'

/**
 * Tầng CAPABILITY: "tài khoản này có tư cách chạy quảng cáo không?"
 *
 * Đây là thứ thay cho câu hỏi cũ "có role ADS không" — role không mang được
 * trạng thái duyệt, còn advertiser_profiles thì có.
 *
 * Cố ý đặt TRƯỚC upload.single(): controller đẩy ảnh lên Cloudinary ngay đầu
 * hàm, nếu chặn ở tầng service thì một tài khoản PENDING/SUSPENDED vẫn kịp
 * tốn một lượt upload rồi mới bị từ chối.
 */
export function requireApprovedAdvertiser(repo: IAdvertiserProfileRepo) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Forbidden('Chưa xác thực')

      const profile = await repo.findByAccountId(Number(req.user.id))
      if (!profile) {
        throw new Forbidden('Tài khoản chưa đăng ký hồ sơ nhà quảng cáo')
      }
      if (profile.status !== ADVERTISERSTATUS.APPROVED) {
        throw new Forbidden(
          `Hồ sơ nhà quảng cáo đang ở trạng thái ${profile.status}`
        )
      }

      res.locals.advertiserProfile = profile
      next()
    } catch (error) {
      next(error)
    }
  }
}
