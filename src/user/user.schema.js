import Joi from 'joi';

const emailRegex = new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$');

export const registerSchema = Joi.object({
  email: Joi.string().required().email().messages({
    'string.email': 'Incorrect email format',
    'string.empty': '"email" cannot be an empty field',
    'any.required': 'missing required field "email"',
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': '"password" cannot be an empty field',
    'string.min': '"password" should have a minimum length of 6',
    'any.required': 'missing required field "password"',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    'string.email': 'Incorrect email format',
    'string.empty': '"email" cannot be an empty field',
    'any.required': 'missing required field "email"',
  }),
  password: Joi.string().required().messages({
    'string.empty': '"password" cannot be an empty field',
    'any.required': 'missing required field "password"',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': '"currentPassword" cannot be empty',
    'any.required': '"currentPassword" is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': '"newPassword" should have a minimum length of 6',
    'any.required': '"newPassword" is required',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': '"name" cannot be an empty field',
  }),
  email: Joi.string().pattern(emailRegex).messages({
    'string.pattern.base': 'Incorrect email format',
    'string.empty': '"email" cannot be an empty field',
  }),
  password: Joi.string().min(6).messages({
    'string.empty': '"password" cannot be an empty field',
    'string.min': '"password" should have a minimum length of 6',
  }),
  avatar_url: Joi.any(),
});

export const updateThemeSchema = Joi.object({
  theme: Joi.string().required().valid('light', 'dark', 'violet').messages({
    'string.empty': '"theme" cannot be an empty field',
    'any.required': 'missing required field "theme"',
  }),
});

export const deleteUserSchema = Joi.object({
  password: Joi.string().required().messages({
    'string.empty': '"password" cannot be empty',
    'any.required': '"password" is required',
  }),
});
