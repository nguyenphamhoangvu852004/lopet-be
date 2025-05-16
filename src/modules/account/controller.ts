import { IAccountService } from '~/modules/account/services/IAccountService'
import { Request, Response } from 'express'
export class AccountController {
  constructor(private service: IAccountService) {
    this.service = service
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id
      const account = await this.service.getById(Number(id))
      if (!account) throw new Error('Not found')
      res.status(200).json({
        code: 200,
        message: 'success',
        data: account
      })
      return
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: (error as Error).message,
        data: error
      })
      return
    }
  }

  async getByUsername(req: Request, res: Response) {
    try {
      const username = req.params.username
      const account = await this.service.getByUsername(username)

      res.status(200).json({
        code: 200,
        message: 'success',
        data: account
      })
      return
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: (error as Error).message,
        data: error
      })
      return
    }
  }


}
