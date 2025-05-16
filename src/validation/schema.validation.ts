import Joi from 'joi'

export const registerValidation = Joi.object({
  email: Joi.string().email().required().trim().strict().min(11),
  password: Joi.string().required().min(6).trim().strict(),
  confirmPassword: Joi.string().required().min(6).trim().strict(),
  username: Joi.string().required().trim().strict()
})

export const loginValidation = Joi.object({
  email: Joi.string().email().required().trim().strict().min(11),
  password: Joi.string().required().min(6).trim().strict()
})
