import { redis } from '~/config/appDataSource'
import { transporter } from '~/config/emailConfig'
import { BadRequest } from '~/error/error.custom'
import { IEmailService } from '~/modules/email/services/IEmailService'
import { handleThrowError } from '~/utils/handle.util'
import { generateOTP } from '~/utils/otp.util'

export default class EmailServiceImpl implements IEmailService {
  async sendOTP(email: string): Promise<void> {
    try {
      const otpKey = `otp:${email}`

      const existingOtp = await redis.get(otpKey)
      if (existingOtp) throw new BadRequest()

      const otp = generateOTP()

      // Lưu OTP vào Redis với TTL 2 phút (120 giây)
      await redis.set(otpKey, otp, { EX: 120 })

      // Gửi email
      const response = await transporter.sendMail({
        to: email,
        subject: 'Mã xác thực OTP của bạn',
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #333;">Xác thực tài khoản</h2>
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Đây là mã OTP để xác thực địa chỉ email của bạn:</p>
      <p style="font-size: 24px; font-weight: bold; color:rgb(111, 0, 255);">${otp}</p>
      <p>Mã OTP này có hiệu lực trong 2 phút.</p>
      <p>Nếu bạn không yêu cầu mã OTP này, vui lòng bỏ qua email này.</p>
      <br>
      <p>Trân trọng,</p>
      <p><strong>Đội ngũ hỗ trợ</strong></p>
    </div>
  `
      })
      if (!response) throw new BadRequest('Send email failed')
      console.log(response)
      return
    } catch (error) {
      handleThrowError(error)
    }
  }

  async verify(data: { email: string; otp: string }): Promise<void> {
    try {
      const { email, otp } = data
      const otpKey = `otp:${email}`

      // Lấy OTP từ Redis
      const savedOtp = await redis.get(otpKey)
      if (!savedOtp) throw new BadRequest('OTP đã hết hạn hoặc không tồn tại.')
      if (savedOtp !== otp) throw new BadRequest('OTP không chính xác.')

      // Sau khi xác thực, xoá OTP và set flag verified
      await redis.del(otpKey)
      await redis.set(`email_verified:${email}`, 'true', { EX: 300 }) // TTL: 5 phút
      return
    } catch (error) {
      handleThrowError(error)
    }
  }
}
