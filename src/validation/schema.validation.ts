import Joi from 'joi'

export const registerValidation = Joi.object({
  email: Joi.string().email().required().trim().strict().min(12),
  username: Joi.string().required().trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),
  confirmPassword: Joi.string().required().min(6).trim().strict()
})

export const loginValidation = Joi.object({
  username: Joi.string().required().trim().strict(),
  password: Joi.string().required().min(6).trim().strict()
})
export const resetPasswordValidation = Joi.object({
  email: Joi.string().required().trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),
  confirmPassword: Joi.string().required().min(6).trim().strict()
})

export const reportValidation = Joi.object({
  reason: Joi.string()
    .required()
    .pattern(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u)
    .required()
    .trim()
    .strict()
})

export const profileValidation = Joi.object({
  fullName: Joi.string()
    // .pattern(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u)
    .required()
    .trim()
    .strict()
})
