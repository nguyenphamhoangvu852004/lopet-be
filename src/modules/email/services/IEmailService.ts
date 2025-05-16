export interface IEmailService {
  sendOTP(data: string): Promise<void>
  verify(data): Promise<void>
}
