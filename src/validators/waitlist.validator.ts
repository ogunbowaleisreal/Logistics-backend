import Joi from "joi";

export const joinWaitlistSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  businessName: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().optional(),
});

export const getWaitlistSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
});
