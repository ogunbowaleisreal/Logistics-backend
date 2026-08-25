import Joi from "joi";

const pricingItemSchema = Joi.object({
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  amount: Joi.number().min(0).required(),
});

const weightBracketItemSchema = Joi.object({
  rideType: Joi.string().valid("bike", "bus_car", "truck", "cargo").required(),
  minKg: Joi.number().min(0).required(),
  maxKg: Joi.number().greater(Joi.ref("minKg")).required(),
  amount: Joi.number().min(0).required(),
});

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
  weightBrackets: Joi.when("useWeightBrackets", {
    is: true,
    then: Joi.array().items(weightBracketItemSchema).min(1).required().messages({
      "array.min": "At least one weight bracket is required when useWeightBrackets is true",
    }),
    otherwise: Joi.array().items(weightBracketItemSchema).optional(),
  }),
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

export const updateGlobalZoneSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  states: Joi.array().items(Joi.string().trim()).min(1).optional(),
  shippingType: Joi.string()
    .valid("local", "inter-state", "international")
    .optional(),
  pricing: Joi.array().items(pricingItemSchema).min(1).optional().messages({
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
}).min(1);
