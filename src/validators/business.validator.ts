import Joi from "joi";

const usernameField = Joi.string()
  .trim()
  .lowercase()
  .min(3)
  .max(30)
  .pattern(/^[a-z0-9]+$/)
  .required()
  .messages({
    "string.pattern.base": "username must contain only letters and numbers",
    "string.min": "username must be at least 3 characters",
    "string.max": "username must not exceed 30 characters",
  });

export const registerBusinessSchema = Joi.object({
  name: Joi.string().trim().required(),
  username: usernameField,
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().trim().required(),
  password: Joi.string().required(),
});

export const checkUsernameSchema = Joi.object({
  username: usernameField,
});
