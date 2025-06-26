import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(6).max(15).required().messages({
    'string.empty':'Username is required',
    'string.min':'Username should have a minimum length of 6',
    'string.max':'Username should have a maximum length of 15',
  }),
  email: Joi.string().email().required().messages({
    'string.empty':'Email is required',
    'string.email':'Please provide a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty':'Password is required',
    'string.min':'Password should have a minimum length of 6',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty':'Email is required',
    'string.email':'Please provide a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty':'Password is required',
  }),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty':'Email is required',
    'string.email':'Please provide a valid email address',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password should have a minimum length of 6',
  }),
});

export const productSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty':'Product name is required',
  }),
  price: Joi.number().positive().required().messages({
    'number.base':'Price must be a number',
    'number.positive':'Price must be a positive number',
    'any.required':'Price is required',
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    'number.base':'Quantity must be a number',
    'number.integer':'Quantity must be an integer',
    'number.min':'Quantity cannot be negative',
    'any.required':'Quantity is required',
  }),
  description: Joi.string().allow('').optional(),
  category: Joi.string().required().messages({
    'string.empty':'Category is required',
  }),
});

export const bulkDeleteSchema = Joi.object({
  productIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.base': 'Product IDs must be an array',
      'array.min': 'At least one product ID is required',
      'array.includes': 'All product IDs must be strings',
      'any.required': 'Product IDs are required',
    }),
})