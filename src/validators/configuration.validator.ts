import Joi from "joi";

const tierSchema = Joi.object({
  minAmount: Joi.number().min(0).required(),
  maxAmount: Joi.number().positive().allow(null).default(null),
  percentage: Joi.number().min(0).max(100).required(),
});

export const updateConfigurationSchema = Joi.object({
  serviceFee: Joi.object({
    tiers: Joi.array().items(tierSchema).min(1).required(),
    cap: Joi.number().positive().required(),
  }).required(),
  VAT: Joi.object({
    type: Joi.string().valid("percentage", "fixed").required(),
    value: Joi.number().min(0).required(),
  }).required(),
});
