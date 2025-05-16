import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key,
        message: d.message
      }))

      res.status(400).json({
        statusCode: 400,
        message: 'Validation error',
        errors
      })
      return // 👈 THÊM return ở đây để fix lỗi TypeScript
    }

    next()
  }
}
