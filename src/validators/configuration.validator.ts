import Joi from "joi";

const tierSchema = Joi.object({
  minAmount: Joi.number().min(0).required(),
  maxAmount: Joi.number().positive().allow(null).default(null),
  percentage: Joi.number().min(0).max(100).required(),
});

const addressSchema = Joi.object({
  street:  Joi.string().allow("").required(),
  city:    Joi.string().allow("").required(),
  state:   Joi.string().allow("").optional(),
  country: Joi.string().allow("").required(),
});

const contactInfoSchema = Joi.object({
  phoneNumbers: Joi.array().items(Joi.string()).optional(),
  emails:       Joi.array().items(Joi.string().email({ tlds: { allow: false } })).optional(),
  address:      addressSchema.optional(),
}).optional();

export const updateConfigurationSchema = Joi.object({
  serviceFee: Joi.object({
    tiers: Joi.array().items(tierSchema).min(1).required(),
    cap: Joi.number().positive().required(),
  }).optional(),
  VAT: Joi.object({
    type: Joi.string().valid("percentage", "fixed").required(),
    value: Joi.number().min(0).required(),
  }).optional(),
  contactInfo: contactInfoSchema,
}).or("serviceFee", "VAT", "contactInfo");

export const updatePaymentMethodSchema = Joi.object({
  isEnabled: Joi.boolean().required(),
});
