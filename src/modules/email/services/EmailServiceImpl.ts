import { transporter } from '~/config/emailConfig'
import { IEmailService } from '~/modules/email/services/IEmailService'
import { handleThrowError } from '~/utils/handle.util'
import { generateOTP } from '~/utils/otp.util'

export const otpStoreMap = new Map()

export default class EmailServiceImpl implements IEmailService {
  async sendOTP(data: string): Promise<void> {
    try {
      //Kiểm tra coi có hay chưa
      const otpInfo = otpStoreMap.get(data)
      if (otpInfo) throw new Error('OTP already sent')
      // tạo 1 mã 6 số
      const otp = generateOTP()
      // lưu vào hệ thống
      otpStoreMap.set(data, {
        otp,
        expiredAt: Date.now() + 2 * 60 * 1000
      })
      // gữi vào email
      await transporter.sendMail({
        to: data,
        subject: 'OTP',
        text: `Cảm ơn mày đã sử dụng dịch của tao. Mã OTP của mày là ${otp}`
      })
      return
    } catch (error) {
      handleThrowError(error)
    }
  }

  async verify(data): Promise<void> {
    try {
      const { email, otp } = data
      // tìm cái email trong map
      const otpInfo = otpStoreMap.get(email)
      // quăng lỗi
      if (!otpInfo) throw new Error('OTP not found')
      // kiểm tra coi OTP còn hạn hay không
      if (otpInfo.expiredAt < Date.now()) throw new Error('OTP expired')
      // kiểmt tra coi OTP có chính xác khôn
      if (otpInfo.otp !== otp) throw new Error('OTP invalid')
      // xoá cái email đó trong map đi
      otpStoreMap.delete(email)
      return
    } catch (error) {
      handleThrowError(error)
    }
  }
}
