import Joi from "joi";

const tierSchema = Joi.object({
  minAmount: Joi.number().min(0).required(),
  maxAmount: Joi.number().positive().allow(null).default(null),
  percentage: Joi.number().min(0).max(100).required(),
});

const TIER_GAP_TOLERANCE = 0.011;

const tiersArraySchema = Joi.array()
  .items(tierSchema)
  .min(1)
  .custom((tiers: Array<{ minAmount: number; maxAmount: number | null; percentage: number }>, helpers) => {
    const sorted = [...tiers].sort((a, b) => a.minAmount - b.minAmount);

    if (sorted[0].minAmount !== 0) {
      return helpers.error("any.invalid", { message: "First tier minAmount must be 0" });
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.maxAmount === null) {
        return helpers.error("any.invalid", { message: `Only the last tier may have maxAmount null (tier ${i + 1} of ${sorted.length} has null)` });
      }

      const expectedNext = current.maxAmount + 0.01;
      if (Math.abs(expectedNext - next.minAmount) > TIER_GAP_TOLERANCE) {
        return helpers.error("any.invalid", {
          message: `Gap or overlap between tier ${i + 1} (maxAmount ${current.maxAmount}) and tier ${i + 2} (minAmount ${next.minAmount})`,
        });
      }
    }

    if (sorted[sorted.length - 1].maxAmount !== null) {
      return helpers.error("any.invalid", { message: "Last tier maxAmount must be null (open-ended)" });
    }

    return sorted;
  })
  .required();

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

export const updateServiceFeeSchema = Joi.object({
  tiers: tiersArraySchema.optional(),
  cap: Joi.number().positive().optional(),
}).or("tiers", "cap");
