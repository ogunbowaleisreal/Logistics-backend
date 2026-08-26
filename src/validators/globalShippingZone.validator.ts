import Joi from "joi";

const pricingItemSchema = Joi.object({
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  amount: Joi.number().min(0).required(),
});

// weightBrackets intentionally NOT included here — brackets are created via
// the dedicated /weight-brackets endpoints, never at zone creation/update time.
export const createGlobalZoneSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().optional(),
  states: Joi.when("shippingType", {
    is: "international",
    then: Joi.array().items(Joi.string().trim()).optional(),
    otherwise: Joi.array().items(Joi.string().trim()).min(1).required(),
  }),
  shippingType: Joi.string()
    .valid("local", "inter-state", "international")
    .default("local"),
  pricing: Joi.array().items(pricingItemSchema).min(1).required().messages({
    "array.min": "At least one pricing entry is required",
  }),
  useWeightBrackets: Joi.boolean().optional(),
  destinationStates: Joi.when("shippingType", {
    is: "inter-state",
    then: Joi.array().items(Joi.string()).min(1).required(),
    otherwise: Joi.array().items(Joi.string()).optional(),
  }),
  countries: Joi.when("shippingType", {
    is: "international",
    then: Joi.array().items(Joi.string()).min(1).required(),
    otherwise: Joi.array().items(Joi.string()).optional(),
  }),
  cities: Joi.array().items(Joi.string()).optional(),
});

export const updateGlobalZoneSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  shippingType: Joi.string()
    .valid("local", "inter-state", "international")
    .optional(),
  states: Joi.array().items(Joi.string().trim()).optional(),
  pricing: Joi.array().items(pricingItemSchema).min(1).optional(),
  useWeightBrackets: Joi.boolean().optional(),
  destinationStates: Joi.array().items(Joi.string()).optional(),
  countries: Joi.array().items(Joi.string()).optional(),
  cities: Joi.array().items(Joi.string()).optional(),
}).min(1);

const weightBracketItemSchema = Joi.object({
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  minKg: Joi.number().min(0).required(),
  maxKg: Joi.number().greater(Joi.ref("minKg")).required(),
  amount: Joi.number().min(0).required(),
});

export const bulkUpsertGlobalWeightBracketsSchema = Joi.object({
  brackets: Joi.array().items(weightBracketItemSchema).min(1).required().messages({
    "array.min": "At least one weight bracket is required",
  }),
});

export const updateGlobalWeightBracketSchema = Joi.object({
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").optional(),
  minKg: Joi.number().min(0).optional(),
  maxKg: Joi.number().optional(),
  amount: Joi.number().min(0).optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (
      value.minKg !== undefined &&
      value.maxKg !== undefined &&
      value.maxKg <= value.minKg
    ) {
      return helpers.error("any.invalid", { message: "maxKg must be greater than minKg" });
    }
    return value;
  })
  .messages({
    "any.invalid": "maxKg must be greater than minKg",
  });

// export const createGlobalZoneSchema = Joi.object({
//   name: Joi.string().trim().required(),
//   description: Joi.string().trim().optional(),
//   states: Joi.when("shippingType", {
//     is: "international",
//     then: Joi.array().items(Joi.string().trim()).optional(),
//     otherwise: Joi.array().items(Joi.string().trim()).min(1).required(),
//   }),
//   shippingType: Joi.string()
//     .valid("local", "inter-state", "international")
//     .default("local"),
//   pricing: Joi.array().items(pricingItemSchema).min(1).required().messages({
//     "array.min": "At least one pricing entry is required",
//   }),
//   useWeightBrackets: Joi.boolean().optional(),
//   destinationStates: Joi.when("shippingType", {
//     is: "inter-state",
//     then: Joi.array().items(Joi.string()).min(1).required(),
//     otherwise: Joi.array().items(Joi.string()).optional(),
//   }),
//   countries: Joi.when("shippingType", {
//     is: "international",
//     then: Joi.array().items(Joi.string()).min(1).required(),
//     otherwise: Joi.array().items(Joi.string()).optional(),
//   }),
//   cities: Joi.array().items(Joi.string()).optional(),
// });

// export const updateGlobalZoneSchema = Joi.object({
//   name: Joi.string().trim().optional(),
//   description: Joi.string().trim().optional(),
//   states: Joi.array().items(Joi.string().trim()).min(1).optional(),
//   shippingType: Joi.string()
//     .valid("local", "inter-state", "international")
//     .optional(),
//   pricing: Joi.array().items(pricingItemSchema).min(1).optional().messages({
//     "array.min": "At least one pricing entry is required",
//   }),
//   useWeightBrackets: Joi.boolean().optional(),
//   destinationStates: Joi.when("shippingType", {
//     is: "inter-state",
//     then: Joi.array().items(Joi.string()).min(1).required(),
//     otherwise: Joi.array().items(Joi.string()).optional(),
//   }),
//   countries: Joi.when("shippingType", {
//     is: "international",
//     then: Joi.array().items(Joi.string()).min(1).required(),
//     otherwise: Joi.array().items(Joi.string()).optional(),
//   }),
//   cities: Joi.array().items(Joi.string()).optional(),
// }).min(1);
