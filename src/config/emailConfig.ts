import nodemailer from 'nodemailer'
import { environment } from '~/config/env'

export const transporter = nodemailer.createTransport({
  host: environment.MAIL_HOST,
  port: Number(environment.MAIL_PORT),
  secure: false,
  auth: {
    user: environment.MAIL_USER,
    pass: environment.MAIL_PASS
  }
})
